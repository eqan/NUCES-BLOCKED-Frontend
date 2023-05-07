import { StudentMetaDataDetails } from "../CV/components/DegreeMetaDataInfo";
import { StudentHeading } from "../CV/components/Header";
import { Contribution, SubContributions } from "../CV/components/StudentContributionsSections";
import { StudentTopSectionInformation } from "../CV/components/StudentTopPriorityInformation";
import { Footer, Student } from "../CV/CV";

export const studentHeading: StudentHeading = {
    studentName: "Eqan Ahmad",
    degreeName: "Bachelors in Computer Science",
    degreeProvider: "National University Of Computer & Emerging Sciences"
}

export const studentMetaDataInfo: StudentMetaDataDetails = {
    degreeId: "32dsj3",
    email: "19F0256@nu.edu.pk",
    rollNumber: "19F0256",
}

export const studentTopPriorityInformation: StudentTopSectionInformation = {
    cgpa: 3.3,
    honors: "4x Gold Medals, 3x Silver Medals"
}

const teacherContributions: SubContributions[] = [
    {
      contributionType: "Research",
      contributor: "Sir Usman Ghous",
      title: "Hyperspectral Imaging",
      contribution: "Contributed 140 Hours to the project where the individual worked on data modeling to increase accuracy by 40%",
      date: "2023-03-02"
    },
    {
      contributionType: "TA Ship",
      contributor: "Sir Tayeb Javed",
      title: "Operating Systems Course",
      contribution: "Contributed 150 Hours in teaching, cross checking and evaluating students assignments, quizes and projects.",
      date: "2022-05-03"
    }
  ]
  
const societyContributions: SubContributions[] = [
    {
      contributionType: "University Event",
      contributor: "FCAP",
      title: "Daira 2023: Lead Speed Programming",
      contribution: "Managed 150+ students from all over Pakistan. Lead role in maintaining the technical deficiencies",
      date: "2023-03-02"
    },
    {
      contributionType: "Society Role",
      contributor: "Silent Steps Society",
      title: "Society President",
      contribution: "As society president held the position for 1 year where he had managed different society teams, organized events.",
      date: "2022-05-03"
    }
  ]
  
const careerCounsellorContributions: SubContributions[] = [
    {
      contributionType: "Exchange Program",
      contributor: "Ayesha Shafiq",
      title: "UGRAD 2023",
      contribution: "Under UGRAD attended Missouri State University for the spring semester and represented the Pakistani Culture on global stage.",
      date: "2023-03-02"
    },
    {
      contributionType: "Internship",
      contributor: "Ayesha Shafiq",
      title: "Arbisoft Internship 2023",
      contribution: "As an internee at arbisoft worked with senior software engineer to develop a python and flask backend api to reduce manual data entry by 50%.",
      date: "2022-05-03"
    }
  ]
  const teacherContribution: Contribution = {
    contributorType: "Teacher",
    subContributions: teacherContributions
  }

  const societyContribution: Contribution = {
    contributorType: "Society",
    subContributions: societyContributions
  }
  
  const careerCounsellorContribution: Contribution = {
    contributorType: "Career Counsellor",
    subContributions: careerCounsellorContributions
  }
  
  const footerProps: Footer = {
    hecTransactionId: "kask32232jkdas",
    chancellorTransactionId: "ewlsdlkalk3232kldsa",
    directorTransactionId: "adsladsl3232k"
  }
  

export const student: Student = {
    heading: studentHeading,
    metaDataDetails: studentMetaDataInfo,
    topPriorityInformation: studentTopPriorityInformation,
    contributions: [teacherContribution, societyContribution, careerCounsellorContribution],
    footerProps: footerProps
  }
