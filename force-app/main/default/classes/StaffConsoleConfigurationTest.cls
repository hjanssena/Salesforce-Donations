/**
 * Proves the part B configuration: campaign rules (RF-S1), team roles (RF-S5),
 * invoice access and the Sent At flow (RF-F2) and manual donations (RF-S3).
 *
 * Test users are created inside the test, so no licenses are used and nothing is
 * kept in the shared org. Role checks run as each user, with user-mode DML and
 * describe calls, so object and field permissions are really enforced.
 */
@IsTest
private class StaffConsoleConfigurationTest {

    private static final String ALIAS_ADMIN = 'tadmin';
    private static final String ALIAS_MANAGER = 'tmanager';
    private static final String ALIAS_MODERATOR = 'tmoder';
    private static final String ALIAS_NO_ROLE = 'tnorole';

    @TestSetup
    static void createUsers() {
        Profile minimum = [SELECT Id FROM Profile WHERE Name = 'Minimum Access - Salesforce' LIMIT 1];
        Map<String, PermissionSet> sets = new Map<String, PermissionSet>();
        for (PermissionSet ps : [
            SELECT Id, Name FROM PermissionSet
            WHERE Name IN ('Donations_Admin', 'Campaign_Manager', 'Moderator')
        ]) {
            sets.put(ps.Name, ps);
        }

        System.runAs(new User(Id = UserInfo.getUserId())) {
            List<User> users = new List<User>{
                buildUser(minimum.Id, ALIAS_ADMIN, true),
                buildUser(minimum.Id, ALIAS_MANAGER, true),
                buildUser(minimum.Id, ALIAS_MODERATOR, false),
                buildUser(minimum.Id, ALIAS_NO_ROLE, false)
            };
            insert users;
            insert new List<PermissionSetAssignment>{
                new PermissionSetAssignment(AssigneeId = users[0].Id, PermissionSetId = sets.get('Donations_Admin').Id),
                new PermissionSetAssignment(AssigneeId = users[1].Id, PermissionSetId = sets.get('Campaign_Manager').Id),
                new PermissionSetAssignment(AssigneeId = users[2].Id, PermissionSetId = sets.get('Moderator').Id)
            };
        }
    }

    // ---------- RF-S1 · Manage Campaigns ----------

    @IsTest
    static void campaignManagerCreatesCompleteCampaign() {
        Campaign c = buildCampaign(Date.today().addDays(1), 5000);
        System.runAs(userByAlias(ALIAS_MANAGER)) {
            Test.startTest();
            Database.insert(c, AccessLevel.USER_MODE);
            Test.stopTest();
        }
        Assert.isNotNull(c.Id, 'CA1: a complete campaign is saved');
    }

    @IsTest
    static void campaignWithoutDescriptionIsRejected() {
        Campaign c = buildCampaign(Date.today().addDays(1), 5000);
        c.Description = null;
        assertInsertFails(c, 'Start date, end date, goal and description are required.', 'CA2: description is required');
    }

    @IsTest
    static void campaignWithoutImageIsRejected() {
        Campaign c = buildCampaign(Date.today().addDays(1), 5000);
        c.Image_Url__c = null;
        assertInsertFails(c, 'Image_Url__c', 'CA2: image is required');
    }

    @IsTest
    static void campaignWithZeroGoalIsRejected() {
        Campaign c = buildCampaign(Date.today().addDays(1), 0);
        assertInsertFails(c, 'The goal must be greater than 0.', 'CA3: goal must be positive');
    }

    @IsTest
    static void campaignEndingBeforeItStartsIsRejected() {
        Campaign c = buildCampaign(Date.today().addDays(10), 5000);
        c.EndDate = Date.today().addDays(5);
        // Salesforce's own campaign date check fires before the team rule; either message proves the rejection.
        assertInsertFails(c, 'end date', 'End date before start date');
    }

    @IsTest
    static void goalCanChangeBeforeCampaignStarts() {
        Campaign c = buildCampaign(Date.today().addDays(1), 5000);
        insert c;
        c.ExpectedRevenue = 8000;
        Test.startTest();
        update c;
        Test.stopTest();
        Assert.areEqual(8000, [SELECT ExpectedRevenue FROM Campaign WHERE Id = :c.Id].ExpectedRevenue, 'CA4: goal editable before start');
    }

    @IsTest
    static void goalIsLockedAfterCampaignStarts() {
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        c.ExpectedRevenue = 8000;
        String message = '';
        Test.startTest();
        try {
            update c;
        } catch (DmlException e) {
            message = e.getMessage();
        }
        Test.stopTest();
        Assert.isTrue(message.contains('The goal can\'t change once the campaign is active.'), 'CA5: goal locked after start. Got: ' + message);
        Assert.areEqual(5000, [SELECT ExpectedRevenue FROM Campaign WHERE Id = :c.Id].ExpectedRevenue, 'CA5: goal unchanged');
    }

    @IsTest
    static void moderatorCannotCreateCampaign() {
        Campaign c = buildCampaign(Date.today().addDays(1), 5000);
        Boolean failed = false;
        System.runAs(userByAlias(ALIAS_MODERATOR)) {
            Test.startTest();
            try {
                Database.insert(c, AccessLevel.USER_MODE);
            } catch (Exception e) {
                failed = true;
            }
            Test.stopTest();
        }
        Assert.isTrue(failed, 'CA6: a moderator cannot create campaigns');
    }

    // ---------- RF-S5 · Role-Based Team Access ----------

    @IsTest
    static void adminHasFullAccessExceptDeleteAndNotices() {
        System.runAs(userByAlias(ALIAS_ADMIN)) {
            Assert.isTrue(Schema.SObjectType.Campaign.isCreateable(), 'Admin creates campaigns');
            Assert.isTrue(Schema.SObjectType.Opportunity.isCreateable(), 'Admin records donations');
            Assert.isTrue(Schema.SObjectType.Invoice_Request__c.fields.RFC__c.isAccessible(), 'Admin sees the RFC');
            Assert.isTrue(Schema.SObjectType.Opportunity.fields.Public_Name__c.isUpdateable(), 'Admin can correct names');
            Assert.isTrue(Schema.SObjectType.Stripe_Event__c.isAccessible(), 'Admin reads rejected notices');
            Assert.isFalse(Schema.SObjectType.Stripe_Event__c.isUpdateable(), 'Notices are read-only');
            Assert.isFalse(Schema.SObjectType.Opportunity.isDeletable(), 'Donations cannot be deleted');
            Assert.isFalse(Schema.SObjectType.Invoice_Request__c.isDeletable(), 'Invoice requests cannot be deleted');
        }
    }

    @IsTest
    static void campaignManagerAccessMatchesRoles() {
        System.runAs(userByAlias(ALIAS_MANAGER)) {
            Assert.isTrue(Schema.SObjectType.Campaign.isCreateable(), 'CA3: creates campaigns');
            Assert.isTrue(Schema.SObjectType.Opportunity.isAccessible(), 'CA3: views donations');
            Assert.isTrue(Schema.SObjectType.Contact.fields.Email.isAccessible(), 'CA5: sees donor email');
            Assert.isTrue(Schema.SObjectType.Invoice_Request__c.fields.RFC__c.isAccessible(), 'CA3: sees the RFC');
            Assert.isFalse(Schema.SObjectType.Invoice_Request__c.isUpdateable(), 'Invoice data is read-only');
            Assert.isFalse(Schema.SObjectType.Opportunity.isCreateable(), 'CA3: cannot record donations');
            Assert.isFalse(Schema.SObjectType.Opportunity.fields.Public_Name__c.isUpdateable(), 'CA3: cannot hide names');
            Assert.isFalse(Schema.SObjectType.Stripe_Event__c.isAccessible(), 'CA3: cannot open rejected notices');
            Assert.isFalse(Schema.SObjectType.PermissionSetAssignment.isCreateable(), 'CA7: cannot assign roles');
        }
    }

    @IsTest
    static void moderatorAccessMatchesRoles() {
        System.runAs(userByAlias(ALIAS_MODERATOR)) {
            Assert.isTrue(Schema.SObjectType.Opportunity.isAccessible(), 'CA4: views donations');
            Assert.isTrue(Schema.SObjectType.Opportunity.fields.Public_Name__c.isUpdateable(), 'CA4: corrects display names');
            Assert.isTrue(Schema.SObjectType.Opportunity.fields.Display_Status__c.isUpdateable(), 'CA4: hides display names');
            Assert.isFalse(Schema.SObjectType.Opportunity.fields.Amount.isUpdateable(), 'Cannot change amounts');
            Assert.isTrue(Schema.SObjectType.Contact.fields.Email.isAccessible(), 'CA5: sees donor email');
            Assert.isFalse(Schema.SObjectType.Contact.fields.Email.isUpdateable(), 'CA4: emails are read-only');
            Assert.isFalse(Schema.SObjectType.Campaign.isCreateable(), 'CA4: cannot create campaigns');
            Assert.isFalse(Schema.SObjectType.Opportunity.isCreateable(), 'CA4: cannot record donations');
            Assert.isFalse(Schema.SObjectType.Invoice_Request__c.isAccessible(), 'CA4: cannot see invoice data or RFC');
            Assert.isFalse(Schema.SObjectType.Stripe_Event__c.isAccessible(), 'CA4: cannot open rejected notices');
            Assert.isFalse(Schema.SObjectType.PermissionSetAssignment.isCreateable(), 'CA7: cannot assign roles');
        }
    }

    @IsTest
    static void userWithoutRoleSeesNothing() {
        System.runAs(userByAlias(ALIAS_NO_ROLE)) {
            Assert.isFalse(Schema.SObjectType.Opportunity.isAccessible(), 'CA6: no donations');
            Assert.isFalse(Schema.SObjectType.Campaign.isAccessible(), 'CA6: no campaigns');
            Assert.isFalse(Schema.SObjectType.Invoice_Request__c.isAccessible(), 'CA6: no invoice data');
            Assert.isFalse(Schema.SObjectType.Stripe_Event__c.isAccessible(), 'CA6: no notices');
        }
    }

    // ---------- RF-S3 · Manually Record a Donation ----------

    @IsTest
    static void adminRecordsManualDonationAndProgressGrows() {
        createSharedOrgFundCampaign();
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        Opportunity o = buildManualDonation(c.Id, 150);
        System.runAs(userByAlias(ALIAS_ADMIN)) {
            Test.startTest();
            Database.insert(o, AccessLevel.USER_MODE);
            Test.stopTest();
        }
        Assert.isNotNull(o.Id, 'CA1: manual donation saved');
        Assert.areEqual(150, [SELECT AmountWonOpportunities FROM Campaign WHERE Id = :c.Id].AmountWonOpportunities,
            'CA1: campaign progress includes the amount');
    }

    @IsTest
    static void manualDonationBelowMinimumIsRejected() {
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        assertInsertFails(buildManualDonation(c.Id, 49), 'A manual donation must be at least 50 MXN.', 'CA2: 50 MXN minimum');
    }

    @IsTest
    static void manualDonationWithoutCampaignIsRejected() {
        assertInsertFails(buildManualDonation(null, 100), 'A manual donation must belong to a campaign.', 'Campaign required');
    }

    @IsTest
    static void onlyAdminCanRecordManualDonations() {
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        for (String alias : new List<String>{ ALIAS_MANAGER, ALIAS_MODERATOR }) {
            Boolean failed = false;
            System.runAs(userByAlias(alias)) {
                try {
                    Database.insert(buildManualDonation(c.Id, 100), AccessLevel.USER_MODE);
                } catch (Exception e) {
                    failed = true;
                }
            }
            Assert.isTrue(failed, 'CA4: ' + alias + ' cannot record donations');
        }
    }

    // ---------- RF-F2 · Invoice requests ----------

    @IsTest
    static void sentAtIsStampedWhenInvoiceIsSent() {
        createSharedOrgFundCampaign();
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        Opportunity o = buildManualDonation(c.Id, 500);
        insert o;
        Invoice_Request__c inv = buildInvoice(o.Id, 'XAXX010101000');
        insert inv;
        Assert.isNull([SELECT Sent_At__c FROM Invoice_Request__c WHERE Id = :inv.Id].Sent_At__c, 'Not sent yet');

        inv.Status__c = 'Sent';
        Test.startTest();
        update inv;
        Test.stopTest();
        Assert.isNotNull([SELECT Sent_At__c FROM Invoice_Request__c WHERE Id = :inv.Id].Sent_At__c, 'Sent At is filled in');
    }

    @IsTest
    static void invalidRfcIsRejected() {
        createSharedOrgFundCampaign();
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        Opportunity o = buildManualDonation(c.Id, 500);
        insert o;
        assertInsertFails(buildInvoice(o.Id, 'NOT-AN-RFC'), 'Invalid RFC format.', 'RFC pattern');
    }

    // ---------- RF-S2 CA1: invoice flag on the donations list ----------

    @IsTest
    static void everyRoleSeesWhetherAnInvoiceWasRequested() {
        createSharedOrgFundCampaign();
        Campaign c = buildCampaign(Date.today().addDays(-1), 5000);
        insert c;
        Opportunity withInvoice = buildManualDonation(c.Id, 500);
        Opportunity withoutInvoice = buildManualDonation(c.Id, 300);
        insert new List<Opportunity>{ withInvoice, withoutInvoice };
        insert buildInvoice(withInvoice.Id, 'XAXX010101000');

        for (String alias : new List<String>{ ALIAS_ADMIN, ALIAS_MANAGER, ALIAS_MODERATOR }) {
            System.runAs(userByAlias(alias)) {
                Map<Id, Opportunity> rows = new Map<Id, Opportunity>(
                    [SELECT Id, Invoice_Requests__c FROM Opportunity
                     WHERE Id IN (:withInvoice.Id, :withoutInvoice.Id) WITH USER_MODE]
                );
                Assert.areEqual(1, rows.get(withInvoice.Id).Invoice_Requests__c, alias + ' sees the request');
                Assert.areEqual(0, rows.get(withoutInvoice.Id).Invoice_Requests__c, alias + ' sees none');
            }
        }
    }

    // ---------- Helpers ----------

    /**
     * Another team's trigger (OpportunityTrigger) runs on every Opportunity insert in this shared
     * sandbox and expects a campaign named 'FONDOS SDU'. Tests that insert donations create it so
     * that trigger can run; this is a workaround for the shared org, not part of this project.
     */
    private static void createSharedOrgFundCampaign() {
        Campaign fund = buildCampaign(Date.today().addDays(-1), 1);
        fund.Name = 'FONDOS SDU';
        fund.put('Total_money_raised_without_commission__c', 0);
        insert fund;
    }

    private static User buildUser(Id profileId, String alias, Boolean marketingUser) {
        String unique = alias + '.' + String.valueOf(Crypto.getRandomInteger()).replace('-', '');
        return new User(
            ProfileId = profileId,
            Alias = alias,
            LastName = 'Test ' + alias,
            Email = alias + '@example.com',
            Username = unique + '@mexicodreamin.test',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'es_MX',
            TimeZoneSidKey = 'America/Mexico_City',
            UserPermissionsMarketingUser = marketingUser
        );
    }

    private static User userByAlias(String alias) {
        return [SELECT Id FROM User WHERE Alias = :alias AND Email = :(alias + '@example.com') LIMIT 1];
    }

    private static Campaign buildCampaign(Date startDate, Decimal goal) {
        return new Campaign(
            Name = 'Test campaign',
            Description = 'Fictitious campaign for tests.',
            Purpose__c = 'Test purpose',
            Image_Url__c = 'https://example.com/image.jpg',
            StartDate = startDate,
            EndDate = startDate.addDays(30),
            ExpectedRevenue = goal,
            RecordTypeId = recordTypeId('Campaign', 'Default')
        );
    }

    private static Opportunity buildManualDonation(Id campaignId, Decimal amount) {
        return new Opportunity(
            Name = 'Manual donation test',
            CampaignId = campaignId,
            Amount = amount,
            CloseDate = Date.today(),
            StageName = wonStage(),
            Source__c = 'Manual',
            Is_Anonymous__c = true,
            Display_Status__c = 'Visible',
            RecordTypeId = recordTypeId('Opportunity', 'Donation')
        );
    }

    private static Invoice_Request__c buildInvoice(Id opportunityId, String rfc) {
        return new Invoice_Request__c(
            Opportunity__c = opportunityId,
            Legal_Name__c = 'Persona Ficticia',
            RFC__c = rfc,
            Taxpayer_Type__c = 'Individual',
            Postal_Code__c = '97000',
            Tax_Regime__c = '612',
            Cfdi_Use__c = 'D04',
            Invoice_Email__c = 'invoice@example.com'
        );
    }

    private static Id recordTypeId(String objectName, String developerName) {
        return Schema.getGlobalDescribe().get(objectName).getDescribe()
            .getRecordTypeInfosByDeveloperName().get(developerName).getRecordTypeId();
    }

    private static String wonStage() {
        return [SELECT ApiName FROM OpportunityStage WHERE IsWon = true AND IsActive = true LIMIT 1].ApiName;
    }

    private static void assertInsertFails(SObject record, String expected, String label) {
        String message = '';
        Test.startTest();
        try {
            insert record;
        } catch (DmlException e) {
            message = e.getMessage();
        }
        Test.stopTest();
        Assert.isTrue(message.toLowerCase().contains(expected.toLowerCase()), label + '. Got: ' + message);
    }
}
