import { Font } from "@react-pdf/renderer";

export const registerFonts = (): void => {
  Font.register({
    family: "Title",
    fonts: [
      {
        fontWeight: "light",
        src: "fonts/WorkSans-Light.ttf",
      },
      {
        fontWeight: "normal",
        src: "fonts/WorkSans-Regular.ttf",
      },
      {
        fontWeight: "medium",
        src: "fonts/WorkSans-Medium.ttf",
      },
      {
        fontWeight: "semibold",
        src: "fonts/WorkSans-SemiBold.ttf",
      },
      {
        fontWeight: "bold",
        src: "fonts/WorkSans-Bold.ttf",
      },
    ],
  });
  Font.register({
    family: "Content",
    fonts: [
      {
        fontWeight: "normal",
        src: "fonts/Raleway-Regular.ttf",
      },
      {
        fontWeight: "normal",
        fontStyle: "italic",
        src: "fonts/Raleway-RegularItalic.ttf",
      },
      {
        fontWeight: "bold",
        src: "fonts/Raleway-Bold.ttf",
      },
    ],
  });
  Font.register({
    family: "FontAwesome",
    src: "fonts/fa-regular-400.ttf",
  });
  Font.register({
    family: "FontAwesome-Solid",
    src: "fonts/fa-solid-900.ttf",
  });
  Font.register({
    family: "FontAwesome-Brands",
    src: "fonts/fa-brands-400.ttf",
  });
};
