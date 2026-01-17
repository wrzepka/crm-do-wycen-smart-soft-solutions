import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { QuoteDataExtended } from '@/types/quote';

// Font installation
Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 }],
});

// Styles
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#333' },

  // HEADER
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: 700,
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoText: { fontSize: 16, fontWeight: 700, color: '#111', textTransform: 'uppercase' },

  // INFO GRID
  infoGrid: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 40, gap: 20 },
  infoCol: { width: '33%' },
  labelMeta: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 3 },
  textMeta: { fontSize: 10, marginBottom: 10, fontWeight: 500, lineHeight: 1.4 },
  textMetaBold: { fontSize: 10, marginBottom: 2, fontWeight: 700, lineHeight: 1.4 },

  // TABLE
  tableContainer: { marginTop: 10, borderWidth: 1, borderColor: '#e2e8f0', borderBottomWidth: 0 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    height: 24,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    minHeight: 24,
  },
  colDesc: { width: '45%', paddingLeft: 8, paddingRight: 4 },
  colQty: { width: '15%', textAlign: 'center' },
  colRate: { width: '20%', textAlign: 'right', paddingRight: 8 },
  colTotal: { width: '20%', textAlign: 'right', paddingRight: 8 },

  bold: { fontWeight: 700 },
  textSmall: { fontSize: 9 },

  // SERVICE GROUP HEADER (Szary pasek)
  serviceGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  groupHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // SUMMARY & FOOTER
  summaryContainer: { marginTop: 30, alignSelf: 'flex-end', width: '40%' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  summaryLabel: { fontSize: 10, color: '#666' },
  summaryValue: { fontSize: 10, fontWeight: 700, textAlign: 'right' },

  paymentBox: {
    marginTop: 30,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    borderStyle: 'dashed',
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentTotalBig: { fontSize: 18, fontWeight: 700, color: '#2563eb' },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: { fontSize: 8, color: '#94a3b8', textAlign: 'center', fontFamily: 'Roboto' },
});

interface QuoteData {
  data: QuoteDataExtended;
}

export function QuoteTemplate({ data }: QuoteData) {
  // const VAT_RATE = 0.23;
  const currency = data.currency || 'PLN';

  // Provider data (hardcoded for now)
  const provider = {
    name: 'Software House Sp. z o.o.',
    address: 'ul. Programistów 1',
    city: '00-000 Warszawa',
    nip: 'PL5250000000',
  };

  // TODO: fix prices
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={styles.mainHeading}>OFERTA</Text>
          <Text style={styles.logoText}>NextCRM</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCol}>
            <Text style={styles.labelMeta}>Numer:</Text>
            <Text style={styles.textMeta}>{data.quote_code}</Text>
            <Text style={styles.labelMeta}>Data wystawienia:</Text>
            <Text style={styles.textMeta}>
              {new Date(data.quote_date).toLocaleDateString('pl-PL')}
            </Text>
          </View>

          {/*TODO: Need to change in future*/}
          <View style={styles.infoCol}>
            <Text style={styles.labelMeta}>DOSTAWCA:</Text>
            <Text style={styles.textMetaBold}>{provider.name}</Text>
            <Text style={styles.textMeta}>
              {provider.address}
              {'\n'}
              {provider.city}
              {'\n'}
              NIP: {provider.nip}
            </Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.labelMeta}>NABYWCA:</Text>
            <Text style={styles.textMetaBold}>
              {`${data.client.first_name} ${data.client.last_name}`}
            </Text>
            {data.client.client_addresses && (
              <>
                <Text style={styles.textMeta}>
                  {data.client.client_addresses.street}{' '}
                  {data.client.client_addresses.building_number}
                  {'\n'}
                  {data.client.client_addresses.postal_code} {data.client.client_addresses.city}
                  {data.client.client_addresses?.nip && (
                    <Text>
                      {'\n'}NIP: {data.client.client_addresses.nip}
                    </Text>
                  )}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Services list */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.bold]}>Usługa / Opis</Text>
            <Text style={[styles.colQty, styles.bold]}>Ilość [jedn.]</Text>
            <Text style={[styles.colRate, styles.bold]}>Stawka</Text>
            <Text style={[styles.colTotal, styles.bold]}>Razem</Text>
          </View>

          {data.pricingServices.map((service, i: number) => (
            <View key={i}>
              {/* Service */}
              <View style={styles.serviceGroupHeader}>
                <Text style={styles.groupHeaderText}>{service.name}</Text>
                <Text style={styles.groupHeaderText}>
                  {Number(service.total_price).toFixed(2)} {currency}
                </Text>
              </View>

              {/* Sub Services list */}
              {service.serviceResources.map((res, j: number) => (
                <View key={j} style={styles.tableRow}>
                  <View style={styles.colDesc}>
                    <Text style={styles.bold}>{res.label || res.position?.name}</Text>
                    {res.position?.name && res.position.name !== res.label && (
                      <Text style={{ fontSize: 8, color: '#666' }}>{res.position.name}</Text>
                    )}
                  </View>
                  <Text style={[styles.colQty, styles.textSmall]}>
                    {Number(res.hours)} [{res.unit}]
                  </Text>
                  <Text style={[styles.colRate, styles.textSmall]}>
                    {Number(res.unitPrice).toFixed(2)}
                  </Text>
                  <Text style={[styles.colTotal, styles.textSmall]}>
                    {(Number(res.hours) * Number(res.unitPrice)).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          {/* If there is any discount, show price without discount first */}
          {1 > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wartość usług:</Text>
              <Text style={styles.summaryValue}>1000 {currency}</Text>
            </View>
          )}

          {/* Discount */}
          {1 > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#ef4444' }]}>Rabat:</Text>
              <Text style={[styles.summaryValue, { color: '#ef4444' }]}>- 50 {currency}</Text>
            </View>
          )}

          {/* Separator if there is any discount*/}
          {1 > 0 && (
            <View
              style={{ height: 1, backgroundColor: '#e2e8f0', marginVertical: 4, width: '100%' }}
            />
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Suma Netto:</Text>
            <Text style={styles.summaryValue}>1111 {currency}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (23%):</Text>
            <Text style={styles.summaryValue}>2222 {currency}</Text>
          </View>
        </View>

        {/* Payment box */}
        <View style={styles.paymentBox}>
          <View>
            <Text style={styles.labelMeta}>TERMIN WAŻNOŚCI:</Text>
            <Text style={{ fontSize: 12, fontWeight: 700 }}>
              {new Date(
                new Date(data.quote_date).getTime() + 30 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString('pl-PL')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.labelMeta}>DO ZAPŁATY:</Text>
            <Text style={styles.paymentTotalBig}>3333 {currency}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dokument wygenerowany elektronicznie, nie wymaga podpisu.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
