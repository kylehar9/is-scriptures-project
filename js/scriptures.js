/**
 * FILE: scriptures.js
 *
 * Author: Kyle Harline
 * Class: IS 542
 * Section: 001
 * Assignment: Project 1
 *
 * Description: Front-end JavaScript code for IS 542 Scriptures Project, BYU Winter 2021.
 *
 *
 */

const Scriptures = (function () {
  "use strict";

  /* ===========================================================
   *                    CONSTANTS
   */
  const URL_BASE = "https://scriptures.byu.edu/";
  const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
  const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;
  const BOTTOM_PADDING = "<br /><br />";
  const CLASS_BOOKS = "books";
  const CLASS_VOLUME = "volume";
  const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
  const DIV_SCRIPTURES = "scriptures";
  const REQUEST_GET = "GET";
  const REQUEST_STATUS_OK = 200;
  const REQUEST_STATUS_ERROR = 400;
  const TAG_HEADERS = "h5";

  /* ===========================================================
   *                    PRIVATE VARIABLES
   */
  let books;
  let volumes;

  /* ===========================================================
   *                    PRIVATE METHOD DECLARATIONS
   */
  let ajax;
  let cacheBooks;
  let htmlAnchor;
  let htmlDiv;
  let htmlElement;
  let htmlLink;
  let htmlHashLink;
  let init;
  let onHashChanged;

  /* ===========================================================
   *                    PRIVATE METHODS
   */
  ajax = function (url, successCallback, failureCallback) {
    const request = new XMLHttpRequest();
    request.open(REQUEST_GET, url, true);

    request.onload = function () {
      if (request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR) {
        const data = JSON.parse(request.response);

        if (typeof successCallback === "function") {
          successCallback(data);
        }
      } else {
        if (typeof failureCallback === "function") {
          failureCallback(request);
        }
      }
    };

    request.onerror = failureCallback;
    request.send();
  };

  cacheBooks = function (callback) {
    volumes.forEach(function (volume) {
      let volumeBooks = [];
      let bookId = volume.minBookId;

      while (bookId <= volume.maxBookId) {
        volumeBooks.push(books[bookId]);
        bookId += 1;
      }

      volume.books = volumeBooks;
    });

    if (typeof callback === "function") {
      callback();
    }
  };

  htmlAnchor = function (volume) {
    return `<a name="v${volume.id}" />`;
  };

  htmlDiv = function (parameters) {
    let classString = "";
    let contentString = "";
    let idString = "";

    if (parameters.classKey !== undefined) {
      classString = ` class="${parameters.classKey}"`;
    }

    if (parameters.content !== undefined) {
      contentString = parameters.content;
    }

    if (parameters.id !== undefined) {
      idString = ` id="${parameters.id}"`;
    }

    return `<div${idString}${classString}>${contentString}</div>`;
  };

  htmlElement = function (tagName, content) {
    return `<${tagName}>${content}</${tagName}>`;
  };

  htmlLink = function (parameters) {
    let classString = "";
    let contentString = "";
    let hrefString = "";
    let idString = "";

    if (parameters.classKey !== undefined) {
      classString = ` class="${parameters.classKey}"`;
    }

    if (parameters.classKey !== undefined) {
      contentString = parameters.content;
    }

    if (parameters.classKey !== undefined) {
      hrefString = ` href="${parameters.href}"`;
    }

    if (parameters.classKey !== undefined) {
      idString = ` id="${parameters.id}"`;
    }

    return `<a${idString}${classString}${hrefString}>${contentString}</a>`;
  };

  htmlHashLink = function (hashArguments, content) {
    return `<a href="javascript:void(0)" onclick="changeHash(${hashArguments})">${content}</a>`;
  };

  init = function (callback) {
    let booksLoaded = false;
    let volumesLoaded = false;

    ajax(URL_BOOKS, function (data) {
      books = data;
      booksLoaded = true;

      if (volumesLoaded) {
        cacheBooks(callback);
      }
    }
    );

    ajax(URL_VOLUMES, function (data) {
      volumes = data;
      volumesLoaded = true;

      if (booksLoaded) {
        cacheBooks(callback);
      }
    }
    );
  };

  onHashChanged = function () {
    console.log(window.location.hash);
  };

  /* ===========================================================
   *                        PUBLIC API
   */

  return {
    init,
    onHashChanged
  };
}());
