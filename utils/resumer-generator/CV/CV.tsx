import { Document, Image, View } from "@react-pdf/renderer";
import { Page } from "../components/Page";
import { Header } from "./components/Header";
import { StudentHighPriorityInformation, StudentTopSectionInformation } from "./components/StudentTopPriorityInformation";
import { Contribution, Contributions } from "./components/StudentContributionsSections";
import { StudentHeading } from "./components/Header";
import { StudentMetaDataDetails } from "./components/DegreeMetaDataInfo";
import { Footer } from "./components/Footer";


export interface Footer{
  hecTransactionId: string,
  chancellorTransactionId: string,
  directorTransactionId: string,
}

export interface Student{
  heading: StudentHeading,
  metaDataDetails: StudentMetaDataDetails,
  topPriorityInformation: StudentTopSectionInformation
  contributions: Contribution[]
  footerProps: Footer
}

type HeaderProps = {
  student: Student;
}

export const CV = ({student}: HeaderProps) => (
  <Document>
  <Page>
    <View style={{ position: 'absolute', left: '37%', top: '50%', right: 0, bottom: 0 }}>
      <Image src="https://upload.wikimedia.org/wikipedia/en/e/e4/National_University_of_Computer_and_Emerging_Sciences_logo.png" style={{ width: '36%', height: '30%', opacity: 0.1 }} />
    </View>
    <Header heading={student.heading} metaDataDetails={student.metaDataDetails} />
    <StudentHighPriorityInformation topSectionInformation={student.topPriorityInformation} />
    {
      student.contributions.map((contribution, index)=> (
        <Contributions contribution={contribution} index={index} />
      ))
    }
    <Footer  {...student.footerProps}/>
  </Page>
  </Document>
);