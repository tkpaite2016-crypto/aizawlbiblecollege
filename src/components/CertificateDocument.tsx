import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// A4 landscape dimensions (points)
const W = 842;
const H = 595;

// Color palette - elegant and professional
const DEEP_NAVY = '#1a2744';
const ROYAL_GOLD = '#b8860b';
const LIGHT_GOLD = '#d4af37';
const DARK_GOLD = '#8b6914';
const IVORY = '#fffef5';
const CRIMSON = '#722f37';
const SLATE_TEXT = '#3d4f5f';

const S = StyleSheet.create({
  page: {
    width: W,
    height: H,
    position: 'relative',
    fontFamily: 'Times-Roman',
    backgroundColor: IVORY,
  },

  // Watermark container - tiled grid pattern
  watermarkContainer: {
    position: 'absolute',
    top: -50,
    left: -100,
    right: -100,
    bottom: -50,
    transform: 'rotate(-30deg)',
    zIndex: 0,
  },
  watermarkRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  watermarkText: {
    fontSize: 24,
    fontFamily: 'Times-Bold',
    color: 'rgba(26, 39, 68, 0.06)',
    marginRight: 40,
  },

  // Outer decorative border
  outerBorder: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 3,
    borderColor: ROYAL_GOLD,
    borderRadius: 2,
    zIndex: 1,
  },

  // Inner border line
  innerBorder: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 1,
    borderColor: DEEP_NAVY,
    borderRadius: 1,
    zIndex: 1,
  },

  // Corner ornaments
  cornerOrnament: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: ROYAL_GOLD,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    zIndex: 2,
  },
  cornerOrnamentTopLeft: {
    top: 12,
    left: 12,
  },
  cornerOrnamentTopRight: {
    top: 12,
    right: 12,
    transform: [{ rotate: '90deg' }],
  },
  cornerOrnamentBottomLeft: {
    bottom: 12,
    left: 12,
    transform: [{ rotate: '-90deg' }],
  },
  cornerOrnamentBottomRight: {
    bottom: 12,
    right: 12,
    transform: [{ rotate: '180deg' }],
  },

  // Main content container
  content: {
    position: 'absolute',
    top: 40,
    left: 50,
    right: 50,
    bottom: 45,
    alignItems: 'center',
    zIndex: 10,
  },

  // Header section
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  logoContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  logoRing: {
    width: 70,
    height: 70,
    borderRadius: 100,
    borderWidth: 2.5,
    borderColor: ROYAL_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: IVORY,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 100,
  },

  collegeName: {
    fontSize: 28,
    fontFamily: 'Times-Bold',
    color: DEEP_NAVY,
    textAlign: 'center',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 8,
  },

  subHeader: {
    fontSize: 9,
    fontFamily: 'Times-Italic',
    color: SLATE_TEXT,
    textAlign: 'center',
    marginTop: 3,
    letterSpacing: 1,
  },

  goldLine: {
    width: 300,
    height: 1.5,
    backgroundColor: ROYAL_GOLD,
    marginTop: 10,
    marginBottom: 8,
  },

  pataText: {
    fontSize: 8,
    fontFamily: 'Times-Italic',
    color: SLATE_TEXT,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  // Certificate title
  certTitleContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  certTitle: {
    fontSize: 16,
    fontFamily: 'Times-Bold',
    color: DARK_GOLD,
    textAlign: 'center',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 250,
    height: 0.5,
    backgroundColor: LIGHT_GOLD,
    marginTop: 6,
  },

  // Main body
  bodySection: {
    alignItems: 'center',
    marginTop: 10,
  },

  introText: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: SLATE_TEXT,
    textAlign: 'center',
    marginBottom: 6,
  },

  studentName: {
    fontSize: 26,
    fontFamily: 'Times-Bold',
    color: DEEP_NAVY,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 4,
  },

  pataRegNo: {
    fontSize: 9,
    fontFamily: 'Times-Bold',
    color: SLATE_TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },

  conferredText: {
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: SLATE_TEXT,
    textAlign: 'center',
    marginTop: 4,
  },

  degreeName: {
    fontSize: 18,
    fontFamily: 'Times-Bold',
    color: CRIMSON,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 10,
  },

  dateText: {
    fontSize: 10,
    fontFamily: 'Times-Roman',
    color: SLATE_TEXT,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 1.5,
  },

  // Signatures
  sigContainer: {
    position: 'absolute',
    bottom: 55,
    left: 80,
    right: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },

  sigBlock: {
    alignItems: 'center',
    width: 140,
  },
  sigImage: {
    height: 35,
    width: 100,
    marginBottom: 2,
    objectFit: 'contain',
  },
  sigLine: {
    width: 120,
    height: 0.5,
    backgroundColor: DEEP_NAVY,
    marginBottom: 3,
  },
  sigName: {
    fontSize: 8,
    fontFamily: 'Times-Bold',
    color: DEEP_NAVY,
    textAlign: 'center',
  },
  sigTitle: {
    fontSize: 7,
    fontFamily: 'Times-Italic',
    color: SLATE_TEXT,
    textAlign: 'center',
    marginTop: 1,
  },

  // Certificate ID
  certId: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#888',
    textAlign: 'center',
    letterSpacing: 0.5,
    zIndex: 10,
  },

  // Decorative seal/badge area
  sealDecoration: {
    position: 'absolute',
    bottom: 65,
    left: 50,
    right: 50,
    alignItems: 'center',
    zIndex: 10,
  },
  sealLine: {
    width: 180,
    height: 0.5,
    backgroundColor: LIGHT_GOLD,
  },
});

type Props = {
  studentName: string;
  course: string;
  completionDate: string;
  certificateId: string;
  pataRegNo?: string;
  chairmanSignatureUrl?: string;
  principalSignatureUrl?: string;
  deanSignatureUrl?: string;
};

export function CertificateDocument({
  studentName,
  course,
  completionDate,
  certificateId,
  pataRegNo,
  chairmanSignatureUrl,
  principalSignatureUrl,
  deanSignatureUrl,
}: Props) {
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

  // Generate watermark text rows for tiled grid pattern
  const watermarkRows = [];
  const rowCount = 18;
  const textPerRow = 6;

  for (let row = 0; row < rowCount; row++) {
    const rowTexts = [];
    for (let col = 0; col < textPerRow; col++) {
      rowTexts.push(
        <Text key={col} style={S.watermarkText}>
          Aizawl Bible College
        </Text>
      );
    }
    watermarkRows.push(
      <View key={row} style={[S.watermarkRow, { marginTop: row === 0 ? 0 : -8 }]}>
        {rowTexts}
      </View>
    );
  }

  return (
    <Document>
      <Page size={[W, H]} style={S.page}>
        {/* Tiled watermark background - rotated grid */}
        <View style={S.watermarkContainer}>
          {watermarkRows}
        </View>

        {/* Decorative borders */}
        <View style={S.outerBorder} />
        <View style={S.innerBorder} />

        {/* Corner ornaments */}
        <View style={[S.cornerOrnament, S.cornerOrnamentTopLeft]} />
        <View style={[S.cornerOrnament, S.cornerOrnamentTopRight]} />
        <View style={[S.cornerOrnament, S.cornerOrnamentBottomLeft]} />
        <View style={[S.cornerOrnament, S.cornerOrnamentBottomRight]} />

        {/* Main content */}
        <View style={S.content}>
          {/* Header */}
          <View style={S.header}>
            <View style={S.logoContainer}>
              <View style={S.logoRing}>
                <Image src="/logo.png" style={S.logo} />
              </View>
            </View>
            <Text style={S.collegeName}>Aizawl Bible College</Text>
            <Text style={S.subHeader}>A Theological Institution of Assemblies of God Mizoram District</Text>
            <View style={S.goldLine} />
            <Text style={S.subHeader}>Regd No: MSR 1801 of 29.07.2025</Text>
            <Text style={S.pataText}>Accredited by Pentecostal Association for Theological Accreditation (PATA)</Text>
          </View>

          {/* Certificate title */}
          <View style={S.certTitleContainer}>
            <Text style={S.certTitle}>Certificate of Graduation</Text>
            <View style={S.titleUnderline} />
          </View>

          {/* Body */}
          <View style={S.bodySection}>
            <Text style={S.introText}>Upon the recommendation of the Faculty of the College</Text>
            <Text style={S.studentName}>{studentName}</Text>
            {pataRegNo && <Text style={S.pataRegNo}>(PATA Registration No: {pataRegNo})</Text>}
            <Text style={S.conferredText}>has successfully completed the requirements for the degree of</Text>
            <Text style={S.degreeName}>{course}</Text>
            <Text style={S.dateText}>
              This degree has been signed by the duly authorized officers{'\n'}
              of the college, and was given on {formattedDate}
            </Text>
          </View>
        </View>

        {/* Decorative line before signatures */}
        <View style={S.sealDecoration}>
          <View style={S.sealLine} />
        </View>

        {/* Signatures */}
        <View style={S.sigContainer}>
          <View style={S.sigBlock}>
            {chairmanSignatureUrl && <Image src={chairmanSignatureUrl} style={S.sigImage} />}
            <View style={S.sigLine} />
            <Text style={S.sigName}>Chairman</Text>
            <Text style={S.sigTitle}>Governing Board</Text>
          </View>

          <View style={S.sigBlock}>
            {principalSignatureUrl && <Image src={principalSignatureUrl} style={S.sigImage} />}
            <View style={S.sigLine} />
            <Text style={S.sigName}>Principal</Text>
            <Text style={S.sigTitle}>Aizawl Bible College</Text>
          </View>

          <View style={S.sigBlock}>
            {deanSignatureUrl && <Image src={deanSignatureUrl} style={S.sigImage} />}
            <View style={S.sigLine} />
            <Text style={S.sigName}>Dean of Academics</Text>
            <Text style={S.sigTitle}>Aizawl Bible College</Text>
          </View>
        </View>

        {/* Certificate ID */}
        <Text style={S.certId}>Certificate ID: {certificateId}</Text>
      </Page>
    </Document>
  );
}
