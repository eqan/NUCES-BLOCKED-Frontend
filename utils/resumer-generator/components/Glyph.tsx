import { Text } from "@react-pdf/renderer";
import styled from "@react-pdf/styled-components";
import { Fonts } from "../utils/theme";

export const Glyph = ({ name, style }) => {
  const code = GlyphConfig[name];
  if (code) {
    const Component = code[0];
    return <Component style={style}>{code[1]}</Component>;
  }
  console.error(
    `Glyph: Unknown name '${name}'. Possible names are: ${KnownNames}`
  );
  return null;
};

export const selectStyledGlyph = (type: string) => {
  type = type.toLowerCase()
  return <StyledGlyph name={type}/>
}

const Regular = styled(Text)`
  font-family: "FontAwesome";
`;

const Solid = styled(Text)`
  font-family: "FontAwesome-Solid";
  font-size: 15px;
`;

const GlyphConfig = {
  teacher: [Solid, "\uf19d"],
  society: [Solid, "\uf0c0"],
  "career counsellor": [Solid, "\uf0ac"],
  certificate: [Solid, "\uf0a3"],
  user: [Solid, "\uf007"],
  verified: [Solid, "\uf00c"],
};

export const KnownNames = Object.keys(GlyphConfig).sort();


const StyledGlyph = styled(Glyph)`
  font-size: ${Fonts.normal * 1.2};
`;