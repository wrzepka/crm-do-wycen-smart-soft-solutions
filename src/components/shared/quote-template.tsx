import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { QuoteDataExtended } from '@/types/quote';
// Fonts setup
Font.register({
  family: 'Roboto',
  fonts: [
    { src: process.cwd() + '/public/fonts/Roboto-Regular.ttf' },
    { src: process.cwd() + '/public/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
});

// Styles setup
const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, borderBottom: 1, borderBottomColor: '#ccc', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 5 },
  row: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    height: 24,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    height: 24,
    fontWeight: 700,
  },
  colDescription: { width: '60%', paddingLeft: 5 },
  colQty: { width: '10%', textAlign: 'center' },
  colPrice: { width: '30%', textAlign: 'right', paddingRight: 5 },
  totalSection: { marginTop: 20, textAlign: 'right' },
  totalText: { fontSize: 14, fontWeight: 700 },
  serviceBlock: { marginBottom: 15 },
  serviceHeader: { fontSize: 12, fontWeight: 700, backgroundColor: '#e2e8f0', padding: 5 },
  subRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#eee',
    padding: 4,
    marginLeft: 10,
  },
  colPos: { width: '50%', fontSize: 9 },
  colHours: { width: '20%', fontSize: 9, textAlign: 'center' },
  colRate: { width: '30%', fontSize: 9, textAlign: 'right' },
  summaryContainer: {
    marginTop: 30,
    alignSelf: 'flex-end',
    width: '40%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: 1,
    borderTopColor: '#333',
    marginTop: 5,
    paddingTop: 5,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#2563eb',
  },
});

interface QuoteData {
  data: QuoteDataExtended;
}

export function QuoteTemplate({ data }: QuoteData) {
  const VAT_RATE = 0.23; // TODO: move to file with const values
  const netTotal = Number(data.cost);
  const vatAmount = netTotal * VAT_RATE;
  const grossTotal = netTotal + vatAmount;
  const currency = data.currency;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Oferta: {data.quote_code}</Text>
          <Text>Data: {new Date(data.quote_date).toLocaleDateString('pl-PL')}</Text>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontWeight: 700 }}>Nabywca:</Text>
            <Text>
              {data.client.first_name} {data.client.last_name}
            </Text>
            {data.client.client_addresses && (
              <>
                <Text>
                  {data.client.client_addresses.street}, {data.client.client_addresses.city}
                </Text>
                <Text>NIP: {data.client.client_addresses.nip}</Text>
              </>
            )}
          </View>
        </View>

        <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 700 }}>Lista usług:</Text>

        {/* List of services (iterated) */}
        {data.pricingServices.map((service, i) => (
          <View key={i} style={styles.serviceBlock}>
            <View style={styles.serviceHeader}>
              <Text>
                {service.name} - {Number(service.total_price).toFixed(2)} {currency}
              </Text>
            </View>

            {/*  */}
            {service.serviceResources.map((res, j) => (
              <View key={j} style={styles.subRow}>
                <Text style={styles.colPos}>{res.position?.name || 'Specjalista'}</Text>
                <Text style={styles.colHours}>{Number(res.hours)} h</Text>
                <Text style={styles.colRate}>
                  {Number(res.unitPrice).toFixed(2)} {currency}/{res.unit}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Suma Netto:</Text>
            <Text style={styles.summaryValue}>
              {netTotal.toFixed(2)} {currency}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>VAT (23%):</Text>
            <Text style={styles.summaryValue}>
              {vatAmount.toFixed(2)} {currency}
            </Text>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>DO ZAPŁATY:</Text>
            <Text style={styles.totalValue}>
              {grossTotal.toFixed(2)} {currency}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
