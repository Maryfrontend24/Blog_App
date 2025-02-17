import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { ArticleItem } from "../components/articleItem/ArticleItem.jsx";
import { useArticles } from "/src/contexts/ArticlesDataContext.jsx";
import ReactMarkdown from "react-markdown";

const SingleArticlePage = () => {
  const { slug } = useParams();
  const { state, fetchSingleArticle } = useArticles();

  // Находим статью
  const article = state.articles.find((art) => art.slug === slug);

  // Загружаем статью
  useEffect(() => {
    if (slug && state.singleArticle?.slug !== slug) {
      fetchSingleArticle(slug);
    }
  }, [slug, state.singleArticle]);

  if (state.errorArticleServer || !state.singleArticle) {
    return <div>Error: {state.errorArticleServer}</div>;
  }

  return (
    <div className="single-article-page">
      {article ? (
        <>
          <ArticleItem
            article={article}
            slug={slug}
            key={slug}
            isSinglePage={true}
          />
          <div
            className="article-body"
            style={{ overflowY: "auto", minHeight: "calc(807px - 140px)" }}
          >
            <ReactMarkdown>{article.body}</ReactMarkdown>
          </div>
        </>
      ) : (
        <div>Article not found</div>
      )}
    </div>
  );
};

export { SingleArticlePage };
