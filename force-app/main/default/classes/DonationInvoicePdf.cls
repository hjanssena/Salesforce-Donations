/**
 * Renders the simulated donation invoice (RF-F3) as a PDF with Salesforce's built-in Blob.toPdf.
 * It is a mock for an academic exercise: it carries a visible "no fiscal validity, not a CFDI" notice,
 * never calls the SAT and has no tax breakdown (donations are shown as not subject to VAT).
 * Pure rendering: no queries and no DML.
 */
public with sharing class DonationInvoicePdf {
    private static final Map<String, String> TAX_REGIMES = new Map<String, String>{
        '601' => 'General de Ley Personas Morales',
        '603' => 'Personas Morales con Fines no Lucrativos',
        '605' => 'Sueldos y Salarios',
        '612' => 'Personas Físicas con Actividades Empresariales',
        '621' => 'Incorporación Fiscal',
        '626' => 'Régimen Simplificado de Confianza'
    };
    private static final Map<String, String> CFDI_USES = new Map<String, String>{
        'D04' => 'Donativos',
        'G03' => 'Gastos en general',
        'S01' => 'Sin efectos fiscales'
    };
    private static final String CELL = 'border:1px solid #9aa5b1;padding:5px;text-align:left;';

    private DonationInvoicePdf() {
        // Static rendering only; never instantiated.
    }

    /**
     * Renders the invoice for one recorded donation.
     * @param donation the donation, with Amount, CloseDate, Stripe_Payment_Intent_Id__c and Campaign.Name
     * @param invoice the invoice request with the donor's tax data
     * @return the PDF
     * @throws IllegalArgumentException when the donation or the invoice request is missing
     * @example
     * Blob pdf = DonationInvoicePdf.render(donation, donation.Invoice_Requests__r[0]);
     */
    public static Blob render(Opportunity donation, Invoice_Request__c invoice) {
        return Blob.toPdf(html(donation, invoice));
    }

    /**
     * The file name shown on the attachment, for example "factura-pi_3Abc123.pdf".
     * @param donation the donation
     * @return the file name
     */
    public static String fileName(Opportunity donation) {
        String reference = donation?.Stripe_Payment_Intent_Id__c;
        return 'factura-' + (String.isBlank(reference) ? 'donativo' : reference.replaceAll('[^A-Za-z0-9_-]', '')) + '.pdf';
    }

    /**
     * Builds the invoice HTML that is rendered to PDF. Every donor value is HTML-escaped.
     * @param donation the donation
     * @param invoice the invoice request
     * @return the HTML
     * @throws IllegalArgumentException when the donation or the invoice request is missing
     */
    @TestVisible
    private static String html(Opportunity donation, Invoice_Request__c invoice) {
        if (donation == null || invoice == null) {
            throw new IllegalArgumentException('A donation and its invoice request are required.');
        }
        String amount = DonationReceiptEmail.formatAmount(donation.Amount);
        String description = 'Donativo - ' + (donation.Campaign?.Name ?? 'Mexico Dreamin');
        String taxpayer = invoice.Taxpayer_Type__c == 'Company' ? 'Persona moral' : 'Persona física';
        return '<html><head><style>body{font-family:Arial Unicode MS,sans-serif;font-size:11px;color:#1f2933;}' +
            'table{border-collapse:collapse;width:100%;margin-bottom:12px;}</style></head><body>' +
            '<h1 style="font-size:18px;">Factura de donativo (simulada)</h1>' +
            '<p style="color:#b42318;">Documento simulado sin validez fiscal. No es un CFDI ni se envió al SAT. ' +
            'Ejercicio académico en modo de prueba.</p>' +
            table(new List<List<String>>{
                new List<String>{'Emisor', 'Mexico Dreamin (programa académico)'},
                new List<String>{'Folio', donation.Stripe_Payment_Intent_Id__c},
                new List<String>{'Fecha', DonationReceiptEmail.formatDate(donation.CloseDate)}
            }) +
            '<h2 style="font-size:14px;">Receptor</h2>' +
            table(new List<List<String>>{
                new List<String>{'Nombre o razón social', invoice.Legal_Name__c},
                new List<String>{'RFC', invoice.RFC__c},
                new List<String>{'Tipo de contribuyente', taxpayer},
                new List<String>{'Código postal', invoice.Postal_Code__c},
                new List<String>{'Régimen fiscal', labelled(invoice.Tax_Regime__c, TAX_REGIMES)},
                new List<String>{'Uso del CFDI', labelled(invoice.Cfdi_Use__c, CFDI_USES)}
            }) +
            '<h2 style="font-size:14px;">Concepto</h2>' +
            '<table><tr>' + column('Cantidad', '12%') + column('Descripción', '48%') + column('Valor unitario', '20%') +
            column('Importe', '20%') +
            '</tr><tr>' + cell('1') + cell(description) + cell(amount) + cell(amount) + '</tr></table>' +
            table(new List<List<String>>{
                new List<String>{'Subtotal', amount},
                new List<String>{'Impuestos', 'Donativo no objeto de IVA'},
                new List<String>{'Total', amount},
                new List<String>{'Forma de pago', 'Tarjeta'},
                new List<String>{'Método de pago', 'PUE - Pago en una sola exhibición'}
            }) +
            '</body></html>';
    }

    private static String table(List<List<String>> rows) {
        String body = '';
        for (List<String> row : rows) { body += '<tr>' + header(row[0]) + cell(row[1]) + '</tr>'; }
        return '<table>' + body + '</table>';
    }

    private static String header(String value) {
        return column(value, '30%');
    }

    private static String column(String value, String width) {
        return '<th style="' + CELL + 'background-color:#eef2f6;width:' + width + ';">' + (value ?? '').escapeHtml4() + '</th>';
    }

    private static String cell(String value) {
        return '<td style="' + CELL + '">' + (value ?? '').escapeHtml4() + '</td>';
    }

    private static String labelled(String code, Map<String, String> catalog) {
        if (String.isBlank(code)) { return ''; }
        return catalog.containsKey(code) ? code + ' - ' + catalog.get(code) : code;
    }
}
