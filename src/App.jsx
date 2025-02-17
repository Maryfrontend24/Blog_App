// eslint-disable-next-line no-unused-vars
import React, { Suspense } from "react";
// eslint-disable-next-line no-unused-vars
import { Route, Routes } from "react-router-dom";
import { SignInPage } from "./pages/SignInPage.jsx";
import { SignUpPage } from "./pages/SignUpPage.jsx";
import { Layout } from "./components/Layout/Layout.jsx";
import { ArticleList } from "./components/articleList/ArticleList.jsx";
import { StartedPage } from "./pages/StartedPage.jsx";
import { SingleArticlePage } from "./pages/SingleArticlePage.jsx";
import { ArticlesProvider } from "./contexts/ArticlesDataContext.jsx";
import { UsersProvider } from "./contexts/UsersContext.jsx";
import { CreateArticlePage } from "./pages/CreateArticlePage.jsx";
import { EditArticlePage } from "./pages/EditArticlePage.jsx";
import { EditAuthorProfile } from "./pages/EditAuthorProfile.jsx";
import { NotFoundError } from "./components/NotFoundError/NotFoundError.jsx";

function App() {
  return (
    <>
      <UsersProvider>
        <ArticlesProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<StartedPage />} />
              <Route path="articles" element={<ArticleList />} />
              <Route path="articles/:slug" element={<SingleArticlePage />} />
              <Route path="signin" element={<SignInPage />} />
              <Route path="signup" element={<SignUpPage />} />
              <Route path="profile" element={<EditAuthorProfile />} />
              <Route path="create-article" element={<CreateArticlePage />} />
              <Route
                path="articles/:slug/edit-article"
                element={<EditArticlePage />}
              />
              <Route path="*" element={<NotFoundError />} />
            </Route>
          </Routes>
        </ArticlesProvider>
      </UsersProvider>
    </>
  );
}

export default App;
