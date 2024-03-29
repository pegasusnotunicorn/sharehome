import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CustomHelmet from "./utils/CustomHelmet.js";

const FreeStickersPage = (props) => {
  const { t } = useTranslation();

  //custom meta tags for this page
  const title = "Love, Career & Magic — Free stickers!";
  const splashImage = `https://lovecareermagic.com/images/freesticker.jpg`;
  const description = t("free sticker page.description");

  //change title of page
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="content max-width">
      <CustomHelmet
        title={title}
        splashImage={splashImage}
        description={description}
      />

      <div className="subcontentWrapper margin-top min-width">
        <div className="characterContent">
          <h2 className="subtitle">{t("free sticker page.title")}</h2>
          <p>{t("free sticker page.description")}</p>
          <p>{t("free sticker page.description2")}</p>
          <p style={{ fontWeight: "bold", color: "red" }}>
            {t("free sticker page.description4")}
          </p>
          <p style={{ fontWeight: "bold", color: "red" }}>
            {t("free sticker page.description5")}
          </p>
          <p style={{ fontWeight: "bold", color: "red" }}>
            {t("free sticker page.description6")}
          </p>

          <form className="stickerTasksWrapper">
            <div
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => {
                window.open("https://bit.ly/lovecareerandmagic");
              }}
            >
              <div className="checkWrapper">
                <input type="checkbox" id="task0" name="task0" />
              </div>
              <label style={{ cursor: "pointer" }} htmlFor="task0">
                {t("free sticker page.task 3")}
              </label>
            </div>
            <div
              className="taskWrapper"
              style={{ textDecoration: "underline", cursor: "pointer" }}
              onClick={() => {
                window.open("http://eepurl.com/hxOEy1");
              }}
            >
              <div className="checkWrapper">
                <input type="checkbox" id="task0" name="task0" />
              </div>
              <label style={{ cursor: "pointer" }} htmlFor="task0">
                {t("free sticker page.task 0")}
              </label>
            </div>
            <div className="taskWrapper">
              <div className="checkWrapper">
                <input type="checkbox" id="task2" name="task2" />
              </div>
              <label htmlFor="task2">{t("free sticker page.task 2")}</label>
            </div>

            {/*
              <div className="taskWrapper" style={{textDecoration:"underline", cursor:"pointer"}} onClick={()=>{
                window.open("https://www.instagram.com/sysifuscorp/");
              }}>
                <div className="checkWrapper"><input type="checkbox" id="task0" name="task0" /></div>
                <label style={{cursor:"pointer"}} htmlFor="task0">{t("free sticker page.task 4")}</label>
              </div>
              <div className="taskWrapper" style={{textDecoration:"underline", cursor:"pointer"}} onClick={()=>{
                window.open("https://twitter.com/sysifuscorp");
              }}>
                <div className="checkWrapper"><input type="checkbox" id="task0" name="task0" /></div>
                <label style={{cursor:"pointer"}} htmlFor="task0">{t("free sticker page.task 5")}</label>
              </div>
            */}
          </form>
        </div>
      </div>

      <div className="subcontentWrapper">
        <div className="couchContainer">
          <img
            className="couch"
            style={{ width: "100%" }}
            src="/images/freesticker.jpg"
            alt={t("free sticker page.description")}
          ></img>
          <img
            className="couch"
            style={{ width: "100%" }}
            src="/images/freesticker2.jpg"
            alt={t("free sticker page.description")}
          ></img>
          <p style={{ marginTop: "1em" }}>
            <NavLink to="/">{t("error page.link")}</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreeStickersPage;
