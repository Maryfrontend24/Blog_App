// import { Pagination, Spin } from "antd";
// import React, { useState, useEffect } from "react";
// import { ArticleItem } from "../articleItem/ArticleItem.jsx";
// import { useArticles } from "../../contexts/ArticlesDataContext.jsx";
//
// const ArticleList = () => {
//   const [showNotFound] = useState(false);
//   const [loading, setLoading] = useState(false);
//
//   const { state, setCurrentPage, currentPage, getArticleList } = useArticles();
//   const { articles, articlesCount } = state;
//
//   useEffect(() => {
//     const fetchArticles = async () => {
//       setLoading(true);
//       await getArticleList();
//       setLoading(false);
//     };
//
//     fetchArticles();
//   }, [currentPage]);
//
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
//
//   return (
//     <>
//       {loading ? (
//         <Spin style={{ display: "block", margin: "20px auto" }} />
//       ) : showNotFound ? (
//         <Typography.Text
//           type="danger"
//           style={{ textAlign: "center", marginTop: "20px" }}
//         >
//           Упс... :(
//         </Typography.Text>
//       ) : (
//         <>
//           <div className="article-list">
//             {articles.map((article) => (
//               <div
//                 key={`${article.slug}-${Math.random()}`}
//                 className="article-item-wrapper"
//               >
//                 <ArticleItem
//                   className="article-item"
//                   article={article}
//                   id={article.slug}
//                   slug={article.slug}
//                 />
//               </div>
//             ))}
//           </div>
//           <Pagination
//             className="pagination"
//             hideOnSinglePage={true}
//             align="center"
//             position="bottom"
//             total={articlesCount}
//             current={currentPage}
//             onChange={handlePageChange}
//           />
//         </>
//       )}
//     </>
//   );
// };
// export { ArticleList };

import React, { useState, useEffect } from "react";
import { Spin, Pagination } from "antd";
import { ArticleItem } from "../articleItem/ArticleItem.jsx";
import { useArticles } from "../../contexts/ArticlesDataContext.jsx";
import { NotFoundError } from "/src/components/NotFoundError/NotFoundError.jsx"; // Импортируем компонент ошибки

const ArticleList = () => {
  const [loading, setLoading] = useState(false);
  const { state, setCurrentPage, currentPage, getArticleList } = useArticles();
  const { articles, articlesCount, errorArticleServer } = state; // Получаем ошибку из состояния контекста

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      await getArticleList();
      setLoading(false);
    };

    fetchArticles();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (errorArticleServer) {
    // Если ошибка есть, показываем компонент ошибки
    return <NotFoundError errorMessage={errorArticleServer} />;
  }

  return (
    <>
      {loading ? (
        <Spin style={{ display: "block", margin: "20px auto" }} />
      ) : (
        <>
          <div className="article-list">
            {articles.map((article) => (
              <div
                key={`${article.slug}-${Math.random()}`}
                className="article-item-wrapper"
              >
                <ArticleItem
                  className="article-item"
                  article={article}
                  id={article.slug}
                  slug={article.slug}
                />
              </div>
            ))}
          </div>
          <Pagination
            className="pagination"
            hideOnSinglePage={true}
            align="center"
            position="bottom"
            total={articlesCount}
            current={currentPage}
            onChange={handlePageChange}
          />
        </>
      )}
    </>
  );
};

export { ArticleList };
