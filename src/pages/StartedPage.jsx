import blog4 from "/src/assets/blog4.webp";
import blog5 from "/src/assets/blog5.webp";
import blog3 from "/src/assets/blog3.webp";

const StartedPage = () => {
  return (
    <div className="started-container">
      <h1 className="started-description">
        Hi, friend! This is a site where you can not be afraid to be yourself,
        express your thoughts, find friends, read useful content, or just enjoy
        popular memes! Come on in, we've been waiting for you :)
      </h1>
      <ul className="started-list">
        <li>
          <img src={blog5} alt="image" loading="lazy" />
        </li>
        <li>
          <img src={blog4} alt="image" loading="lazy" />
        </li>
        <li>
          <img src={blog3} alt="image" loading="lazy" />
        </li>
      </ul>
      <img
        className="banner"
        src="/src/assets/blog1.webp"
        alt="banner"
        loading="lazy"
      ></img>
    </div>
  );
};

export { StartedPage };
