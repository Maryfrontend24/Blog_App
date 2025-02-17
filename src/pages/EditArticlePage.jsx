// eslint-disable-next-line no-unused-vars
import { FormArticle } from "/src/components/FormsArticle/FormArticle.jsx";
import { useParams } from "react-router-dom";

const EditArticlePage = () => {
  const { slug } = useParams();
  return <FormArticle isEditing={!!slug} />;
};
export { EditArticlePage };
