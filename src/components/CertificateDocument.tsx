import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const GOLD = '#8B6B14';
const NAVY = '#1a2e8a';
const RED = '#b91c1c';
const LIGHT_BLUE = '#ccd8ee';
const CREAM = '#fffef5';

const S = StyleSheet.create({
  page: {
    width: 841.89,
    height: 595.28,
    backgroundColor: CREAM,
    position: 'relative',
  },
  // Decorative borders
  outerBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 4,
    borderColor: GOLD,
  },
  outerBorder2: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1,
    borderColor: GOLD,
  },
  innerBorder: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 3,
    borderColor: GOLD,
  },
  innerBorder2: {
    position: 'absolute',
    top: 23,
    left: 23,
    right: 23,
    bottom: 23,
    borderWidth: 1,
    borderColor: GOLD,
  },
  // Content area
  content: {
    position: 'absolute',
    top: 28,
    left: 28,
    right: 28,
    bottom: 28,
    alignItems: 'center',
  },
  // Header
  collegeName: {
    fontSize: 26,
    fontFamily: 'Times-Bold',
    color: NAVY,
    textAlign: 'center',
    letterSpacing: 4,
    marginTop: 6,
  },
  regnNo: {
    fontSize: 9,
    fontFamily: 'Times-Roman',
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
  institutionText: {
    fontSize: 9,
    fontFamily: 'Times-Italic',
    color: '#555',
    textAlign: 'center',
    marginTop: 1,
  },
  seal: {
    width: 52,
    height: 52,
    marginTop: 4,
    marginBottom: 2,
  },
  dividerLine: {
    width: 600,
    height: 1,
    backgroundColor: GOLD,
    marginTop: 3,
    marginBottom: 4,
  },
  // Body
  recommendationText: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#555',
    textAlign: 'center',
    marginTop: 2,
  },
  studentName: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    color: '#111',
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  pataReg: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 3,
  },
  conferredText: {
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: '#444',
    textAlign: 'center',
    marginTop: 4,
  },
  degreeName: {
    fontSize: 18,
    fontFamily: 'Times-Bold',
    color: RED,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },
  signedStatement: {
    fontSize: 11,
    fontFamily: 'Times-BoldItalic',
    color: '#222',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 1.5,
  },
  // Signatures
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: 720,
    paddingHorizontal: 30,
  },
  sigBlock: {
    alignItems: 'center',
    width: 180,
  },
  chairmanSig: {
    fontSize: 13,
    fontFamily: 'Times-BoldItalic',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 1,
  },
  sigLine: {
    width: 140,
    height: 1,
    backgroundColor: '#444',
    marginBottom: 4,
  },
  sigLabel: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: '#333',
    textAlign: 'center',
  },
  certId: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#aaa',
    textAlign: 'center',
  },
});

// Watermark watermarkRows
function Watermark() {
  const rows: React.ReactElement[] = [];
  const rowHeight = 26;
  const colWidth = 160;
  const numRows = 22;
  const numCols = 6;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const offset = r % 2 === 0 ? 0 : 80;
      rows.push(
        <Text
          key={`wm-${r}-${c}`}
          style={{
            position: 'absolute',
            top: r * rowHeight,
            left: c * colWidth + offset - 80,
            fontSize: 7.5,
            fontFamily: 'Helvetica-Bold',
            color: LIGHT_BLUE,
            letterSpacing: 2,
          }}
        >
          AIZAWL BIBLE COLLEGE
        </Text>
      );
    }
  }
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 841.89,
        height: 595.28,
        overflow: 'hidden',
      }}
    >
      {rows}
    </View>
  );
}

type Props = {
  studentName: string;
  course: string;
  completionDate: string;
  certificateId: string;
  pataRegNo?: string;
};

export function CertificateDocument({ studentName, course, completionDate, certificateId, pataRegNo }: Props) {
  const date = new Date(completionDate);
  const day = date.getDate();
  const month = date.toLocaleDateString('en-IN', { month: 'long' });
  const year = date.getFullYear();

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formattedDate = `${ordinal(day)} ${month}, ${year}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={S.page}>
        {/* Watermark background */}
        <Watermark />

        {/* Decorative borders */}
        <View style={S.outerBorder} />
        <View style={S.outerBorder2} />
        <View style={S.innerBorder} />
        <View style={S.innerBorder2} />

        {/* Content */}
        <View style={S.content}>
          {/* College name */}
          <Text style={S.collegeName}>AIZAWL BIBLE COLLEGE</Text>
          <Text style={S.regnNo}>Regd No: MSR 1801 of 29.07.2025</Text>
          <Text style={S.institutionText}>A Theological Institution of Assemblies of God Mizoram District</Text>
          <Text style={S.institutionText}>Accredited by Pentecostal Association for Theological Accreditation (PATA)</Text>

          {/* Seal */}
          <Image src="/logo.png" style={S.seal} />

          <View style={S.dividerLine} />

          {/* Body */}
          <Text style={S.recommendationText}>Upon the recommendation of the Faculty of the College</Text>

          <Text style={S.studentName}>{studentName}</Text>

          {pataRegNo ? (
            <Text style={S.pataReg}>(PATA REG.#: {pataRegNo})</Text>
          ) : null}

          <Text style={S.conferredText}>has been conferred the degree of</Text>

          <Text style={S.degreeName}>{course.toUpperCase()}</Text>

          <Text style={S.signedStatement}>
            This degree has been signed by the duly authorized officers of the college,{'\n'}
            and was given on {formattedDate}
          </Text>

          {/* Signatures */}
          <View style={S.sigRow}>
            <View style={S.sigBlock}>
              <Text style={S.chairmanSig}>C.S. Muanga</Text>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>Chairman</Text>
            </View>
            <View style={S.sigBlock}>
              <Text style={{ ...S.chairmanSig, opacity: 0 }}>.</Text>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>Principal</Text>
            </View>
            <View style={S.sigBlock}>
              <Text style={{ ...S.chairmanSig, opacity: 0 }}>.</Text>
              <View style={S.sigLine} />
              <Text style={S.sigLabel}>Dean of Academics</Text>
            </View>
          </View>
        </View>

        <Text style={S.certId}>Certificate ID: {certificateId}</Text>
      </Page>
    </Document>
  );
}
