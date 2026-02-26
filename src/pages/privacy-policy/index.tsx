import React from "react";
import Layout from "@/components/Layout";
import { privacypolicy } from "@/assets/static";
import { ContentComponent } from "@/components/ContentComponent";

const PrivacyPolicy: React.FC = () => {

  return (
    <Layout title={"Privacy Policy"} path={"privacy-policy"}>
      <ContentComponent contents={privacypolicy} />
    </Layout>
  );
};

export default PrivacyPolicy;
