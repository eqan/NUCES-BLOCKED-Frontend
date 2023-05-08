import { Text, View } from "@react-pdf/renderer"

const SignatureLine = ({ title, signature, marginLeft, marginRight }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', marginLeft, marginRight }}>
      <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 10 }}>{signature}</Text>
      <View style={{ borderBottom: '1 solid black', width: '80pt', marginBottom: '4pt', marginTop: '2pt' }}></View>
      <Text style={{ fontSize: 8, marginTop: '2pt' }}>{title}</Text>
    </View>
  );
};


export const Footer = ({chancellorTransactionId, hecTransactionId, directorTransactionId}) =>  (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: '30pt', left: 0, right: 0, borderTop: '1 solid black', paddingTop: '10pt', marginBottom: 10 }}>
    <SignatureLine title="Univ. Chancellor Transaction Signature" signature={chancellorTransactionId} marginLeft="10pt" />
    <SignatureLine title="HEC Transaction Signature" signature={hecTransactionId} />
    <SignatureLine title="Univ. Director Transaction Signature" signature={directorTransactionId} marginRight="10pt" />
  </View>
)
