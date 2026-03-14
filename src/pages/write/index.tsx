
import { FC } from "react";
import Layout from "@/components/Layout";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import Write from "@/components/write";


const Index: FC = () => {

  return (
    <Layout>
      <Write />
    </Layout>
  );
};

export default PrivateRoute(Index);
