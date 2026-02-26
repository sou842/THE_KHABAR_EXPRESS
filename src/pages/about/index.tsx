import { ContentComponent } from "@/components/ContentComponent";
import Layout from "@/components/Layout";
import { FC } from "react";
import { aboutpolicy } from "@/assets/static/index";

const About: FC = () => {
  return (
    <Layout title={"About"} path={"about"}>
      <ContentComponent contents={aboutpolicy} />
    </Layout>
  );
};

export default About;
