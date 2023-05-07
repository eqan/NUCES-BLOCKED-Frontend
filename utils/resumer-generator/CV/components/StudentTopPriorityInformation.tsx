import { Container, Group, GroupName } from "../templates/TopPriorityInfromationTemplate";

export interface StudentTopSectionInformation {
  cgpa: number,
  honors?: string | null
}

type HeaderProps = {
  topSectionInformation: StudentTopSectionInformation;
}

export const StudentHighPriorityInformation = ({topSectionInformation}: HeaderProps, props: any) => (
  <Container {...props}>
    <Group>
      <GroupName>CGPA:{"  "}{topSectionInformation.cgpa}/4</GroupName>
      
    </Group>
      {
        topSectionInformation.honors && (
          <Group>
            <GroupName>Honors: {"  "}</GroupName>
            {topSectionInformation.honors}
          </Group>
        )
      }
  </Container>
);
