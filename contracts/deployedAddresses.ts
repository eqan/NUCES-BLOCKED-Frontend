import { registerEnumType } from '@nestjs/graphql';

export enum DeployedContracts {
  SemesterStore = '0x55e49d307e3886536A902214BEBA73faa2366dEE',
  CertificateStore = '0xF2bB140fB23014EFAcbae6Ee1698aA2f8CdeB87F',
}

registerEnumType(DeployedContracts, {
  name: 'DeployedContractsEnum',
});
