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
  const BOTTOM_PADDING = "<br /><br />";
  const CLASS_BOOKS = "books";
  const CLASS_BUTTON = "btn";
  const CLASS_CHAPTER = "chapter";
  const CLASS_VOLUME = "volume";
  const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
  const DIV_SCRIPTURES = "scriptures";
  const INDEX_PLACENAME = 2;
  const INDEX_FLAG = 11;
  const INDEX_LATITUDE = 3;
  const INDEX_LONGITUDE = 4;
  const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
  const REQUEST_GET = "GET";
  const REQUEST_STATUS_OK = 200;
  const REQUEST_STATUS_ERROR = 400;
  const SINGLE_BOTTOM_PADDING = "<br />";
  const TAG_HEADERS = "h5";
  const URL_BASE = "https://scriptures.byu.edu/";
  const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
  const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
  const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;

  /* ===========================================================
   *                    PRIVATE VARIABLES
   */
  let books;
  let gmMarkers = [];
  let volumes;

  /* ===========================================================
   *                    PRIVATE METHOD DECLARATIONS
   */
  let addMarker;
  let ajax;
  let bookChapterValid;
  let booksGrid;
  let booksGridContent;
  let chaptersGrid;
  let chaptersGridContent;
  let cacheBooks;
  let clearMarkers;
  let encodedScripturesUrlParameters;
  let getScripturesCallback;
  let getScripturesFailure;
  let htmlAnchor;
  let htmlDiv;
  let htmlElement;
  let htmlLink;
  let htmlHashLink;
  let init;
  let navigateBook;
  let navigateChapter;
  let navigateHome;
  let nextChapter;
  let previousChapter;
  let onHashChanged;
  let setupMarkers;
  let showLocation;
  let titleForBookChapter;
  let volumesGridContent;

  /* ===========================================================
   *                    PRIVATE METHODS
   */

  addMarker = function (placename, latitude, longitude) {
    // TO-DO: Check to see if we already have this latitude/longitude in gmMarkers array
    // Add marker to gmMarkers array only if we don't already have one for that location
    let marker = new google.maps.Marker({
      position: { lat: Number(latitude), lng: Number(longitude) },
      map,
      title: placename,
      animation: google.maps.Animation.DROP
    });

    // Name we are trying to use... do I already have a name for that marker?
    // Use a substring and compare whether that name is already in there
    gmMarkers.push(marker);
  };

  ajax = function (url, successCallback, failureCallback, skipJsonParse) {
    const request = new XMLHttpRequest();
    request.open(REQUEST_GET, url, true);

    request.onload = function () {
      if (request.status >= REQUEST_STATUS_OK && request.status < REQUEST_STATUS_ERROR) {
        const data = (
          skipJsonParse
            ? request.response
            : JSON.parse(request.response)
        );

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

  bookChapterValid = function (bookId, chapter) {
    let book = books[bookId];

    if (book === undefined || chapter < 0 || chapter > book.numChapters) {
      return false;
    }

    if (chapter === 0 && book.numChapters > 0) {
      return false;
    }

    return true;
  };

  booksGrid = function (volume) {
    return htmlDiv({
      classKey: CLASS_BOOKS,
      content: booksGridContent(volume)
    });
  };

  booksGridContent = function (volume) {
    let gridContent = "";

    volume.books.forEach(function (book) {
      gridContent += htmlLink({
        classKey: CLASS_BUTTON,
        id: book.id,
        href: `#${volume.id}:${book.id}`,
        content: book.gridName
      });
    });

    return gridContent;
  };

  chaptersGrid = function (book) {
    return htmlDiv({
      classKey: CLASS_VOLUME,
      content: htmlElement(TAG_HEADERS, book.fullName)
    }) + htmlDiv({
      classKey: CLASS_BOOKS,
      content: chaptersGridContent(book)
    });
  };

  chaptersGridContent = function (book) {
    let gridContent = "";
    let chapter = 1;

    while (chapter <= book.numChapters) {
      gridContent += htmlLink({
        classKey: `${CLASS_BUTTON} ${CLASS_CHAPTER}`,
        id: chapter,
        href: `#0:${book.id}:${chapter}`,
        content: chapter
      });

      chapter += 1;
    }

    return gridContent;
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

  clearMarkers = function () {
    gmMarkers.forEach(function (marker) {
      marker.setMap(null);
    });

    gmMarkers = [];
  };

  encodedScripturesUrlParameters = function (bookId, chapter, verses, isJst) {
    if (bookId !== undefined && chapter !== undefined) {
      let options = "";

      if (verses !== undefined) {
        options += verses;
      }

      if (isJst !== undefined) {
        options += "&jst=JST";
      }

      return `${URL_SCRIPTURES}?book=${bookId}&chap=${chapter}&verses${options}`;
    }
  };

  getScripturesCallback = function (chapterHtml) {
    let ids = [];
    let prevChap;
    let nextChap;
    let buttonSpacer = " | ";
    let prevButtonHTML;
    let nextButtonHTML;

    if (location.hash !== "" && location.hash.length > 1) {
      ids = location.hash.slice(1).split(":");
    }

    prevChap = previousChapter(ids[1], ids[2]);
    nextChap = nextChapter(ids[1], ids[2]);

    document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;

    if (nextChap === undefined || prevChap === undefined) {
      buttonSpacer = "";
    }

    document.getElementsByClassName("divtitle")[0].innerHTML += SINGLE_BOTTOM_PADDING;

    if (prevChap !== undefined) {
      let prevButton = htmlLink({
        classKey: CLASS_BUTTON,
        content: "Prev",
        href: `#${ids[0]}:${prevChap[0]}:${prevChap[1]}`,
        id: "prev"
      });
      prevButtonHTML = prevButton + buttonSpacer;

      document.getElementsByClassName("divtitle")[0].innerHTML += prevButtonHTML;
    }

    if (nextChap !== undefined) {
      let nextButton = htmlLink({
        classKey: CLASS_BUTTON,
        content: "Next",
        href: `#${ids[0]}:${nextChap[0]}:${nextChap[1]}`,
        id: "next"
      });
      nextButtonHTML = buttonSpacer + nextButton;

      document.getElementsByClassName("divtitle")[0].innerHTML += nextButton;
    }

    setupMarkers();
  };

  getScripturesFailure = function () {
    document.getElementById(DIV_SCRIPTURES).innerHTML = "Unable to retrieve chapter contents.";
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

    if (parameters.content !== undefined) {
      contentString = parameters.content;
    }

    if (parameters.href !== undefined) {
      hrefString = ` href="${parameters.href}"`;
    }

    if (parameters.id !== undefined) {
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

  navigateBook = function (bookId) {
    let book = books[bookId];

    if (book.numChapters <= 1) {
      navigateChapter(bookId, book.numChapters);
    } else {
      document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv({
        id: DIV_SCRIPTURES_NAVIGATOR,
        content: chaptersGrid(book)
      });
    }
  };

  navigateChapter = function (bookId, chapter) {
    ajax(encodedScripturesUrlParameters(bookId, chapter), getScripturesCallback, getScripturesFailure, true);
  };

  navigateHome = function (volumeId) {
    document.getElementById(DIV_SCRIPTURES).innerHTML =
      htmlDiv({
        id: DIV_SCRIPTURES_NAVIGATOR,
        content: volumesGridContent(volumeId)
      });
  };

  onHashChanged = function () {
    let ids = [];

    if (location.hash !== "" && location.hash.length > 1) {
      ids = location.hash.slice(1).split(":");
    }

    if (ids.length <= 0) {
      navigateHome();
    } else if (ids.length === 1) {
      let volumeId = Number(ids[0]);

      if (volumeId < volumes[0].id || volumeId > volumes.slice(-1)[0].id) {
        navigateHome();
      } else {
        navigateHome(volumeId);
      }
    } else {
      let bookId = Number(ids[1]);

      if (books[bookId] === undefined) {
        navigateHome();
      } else {
        if (ids.length === 2) {
          navigateBook(bookId);
        } else {
          let chapter = Number(ids[2]);

          if (bookChapterValid(bookId, chapter)) {
            navigateChapter(bookId, chapter);
          } else {
            navigateHome();
          }
        }
        navigateBook(bookId);
      }
    }
  };

  nextChapter = function (bookId, chapter) {
    chapter = Number(chapter);
    bookId = Number(bookId);
    let book = books[bookId];

    if (book !== undefined) {
      if (chapter < book.numChapters) {
        return [
          bookId,
          chapter + 1,
          titleForBookChapter(book, chapter + 1)
        ];
      }

      let nextBook = books[bookId + 1];

      if (nextBook !== undefined) {
        let nextChapterValue = 0;

        if (nextBook.numChapters > 0) {
          nextChapterValue = 1;
        }

        return [
          nextBook.id,
          nextChapterValue,
          titleForBookChapter(nextBook, nextChapterValue)
        ];
      }
    }
  };

  previousChapter = function (bookId, chapter) {
    let book = books[bookId];

    if (book !== undefined) {
      if (chapter > 1) {
        return [
          bookId,
          chapter - 1,
          titleForBookChapter(book, chapter - 1)
        ];
      }

      let previousBook = books[bookId - 1];

      if (previousBook !== undefined) {
        let previousBookChapterValue = previousBook.numChapters;

        return [
          previousBook.id,
          previousBookChapterValue,
          titleForBookChapter(previousBook, previousBookChapterValue)
        ];
      }
    }
  };

  setupMarkers = function () {
    if (gmMarkers.length > 1) {
      let bounds = new google.maps.LatLngBounds();
      for (let i = 0; i < gmMarkers.length; i++) {
        bounds.extend(gmMarkers[i].position);
      }
      map.fitBounds(bounds);
    } else if (gmMarkers.length <= 0) {
      map.setCenter({ lat: 31.7683, lng: 35.2137 });
      map.setZoom(8);
    } else {
      map.setCenter(gmMarkers[0].position);
      map.setZoom(8);
    }

    document.querySelectorAll("a[onclick^=\"showLocation(\"]").forEach(function (element) {
      let matches = LAT_LON_PARSER.exec(element.getAttribute("onclick"));

      if (matches) {
        let placename = matches[INDEX_PLACENAME];
        let latitude = matches[INDEX_LATITUDE];
        let longitude = matches[INDEX_LONGITUDE];
        let flag = matches[INDEX_FLAG];

        if (flag !== "") {
          placename = `${placename} ${flag}`;
        }

        addMarker(placename, latitude, longitude);
      }
    });
  };

  showLocation = function (geotagId, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewAltitude, viewHeading) {
    console.log(geotagId, placename, latitude);
  };

  titleForBookChapter = function (book, chapter) {
    if (book !== undefined) {
      if (chapter > 0) {
        return `${book.tocName} ${chapter}`;
      }

      return book.tocName;
    }
  };

  volumesGridContent = function (volumeId) {
    let gridContent = "";

    volumes.forEach(function (volume) {
      if (volumeId === undefined || volumeId === volume.id) {
        gridContent += htmlDiv({
          classKey: CLASS_VOLUME,
          content: htmlAnchor(volume) + htmlElement(TAG_HEADERS, volume.fullName)
        });

        gridContent += booksGrid(volume);
      }
    });

    return gridContent + BOTTOM_PADDING;
  };

  /* ===========================================================
   *                        PUBLIC API
   */

  return {
    init,
    onHashChanged,
    showLocation
  };
}());
