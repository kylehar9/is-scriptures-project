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
  const CLASS_ICON = "material-icons";
  const CLASS_VOLUME = "volume";
  const DIV_BREADCRUMBS = "crumbs";
  const DIV_SCRIPTURES_NAVIGATOR = "scripnav";
  const DIV_SCRIPTURES = "scriptures";
  const INDEX_FLAG = 11;
  const INDEX_LATITUDE = 3;
  const INDEX_LONGITUDE = 4;
  const INDEX_PLACENAME = 2;
  const LAT_LON_PARSER = /\((.*),'(.*)',(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),'(.*)'\)/;
  const MAX_ZOOM_LEVEL = 18;
  const MIN_ZOOM_LEVEL = 6;
  const REQUEST_GET = "GET";
  const REQUEST_STATUS_OK = 200;
  const REQUEST_STATUS_ERROR = 400;
  const SINGLE_BOTTOM_PADDING = "<br />";
  const TAG_HEADER5 = "h5";
  const TAG_LIST_ITEM = "li";
  const TAG_SPAN = "span";
  const TAG_UNORDERED_LIST = "ul";
  const TEXT_TOP_LEVEL = "The Scriptures";
  const URL_BASE = "https://scriptures.byu.edu/";
  const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
  const URL_SCRIPTURES = `${URL_BASE}mapscrip/mapgetscrip.php`;
  const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;
  const ZOOM_RATIO = 450;

  /* ===========================================================
   *                    PRIVATE VARIABLES
   */
  let books;
  let gmLabels = [];
  let gmMarkers = [];
  let initializedMapLabel = false;
  let requestedBookId;
  let requestedChapter;
  let requestedNextPrevious;
  let volumes;

  /* ===========================================================
   *                    PRIVATE METHOD DECLARATIONS
   */
  let addMarker;
  let ajax;
  let bookChapterValid;
  let booksGrid;
  let booksGridContent;
  let cacheBooks;
  let chaptersGrid;
  let chaptersGridContent;
  let clearMarkers;
  let encodedScripturesUrlParameters;
  let getScripturesCallback;
  let getScripturesFailure;
  let htmlAnchor;
  let htmlDiv;
  let htmlElement;
  let htmlLink;
  let htmlListItem;
  let htmlListItemLink;
  let init;
  let injectBreadcrumbs;
  let markerIndex;
  let mergePlacename;
  let navigateBook;
  let navigateChapter;
  let navigateHome;
  let nextChapter;
  let nextPreviousMarkup;
  let onHashChanged;
  let previousChapter;
  let setupMarkers;
  let showLocation;
  let titleForBookChapter;
  let volumeForId;
  let volumesGridContent;
  let zoomMapToFitMarkers;

  /* ===========================================================
   *                    PRIVATE METHODS
   */

  // This exact code for addMarker was written Dr. Liddle.
  // See previous commits for version written by me.
  addMarker = function (placename, latitude, longitude) {
    let index = markerIndex(latitude, longitude);

    if (index >= 0) {
      mergePlacename(placename, index);
    } else {
      let marker = new google.maps.Marker({
        position: { lat: Number(latitude), lng: Number(longitude) },
        map,
        title: placename,
        animation: google.maps.Animation.DROP
      });

      gmMarkers.push(marker);

      if (!initializedMapLabel) {
        const initialize = MapLabelInit;

        initialize();
        initializedMapLabel = true;
      }

      let mapLabel = new MapLabel({
        text: marker.getTitle(),
        position: new google.maps.LatLng(Number(latitude), Number(longitude)),
        map,
        fontSize: 16,
        fontColor: "#201000",
        strokeColor: "#fff8f0",
        align: "left"
      });

      gmLabels.push(mapLabel);
    }
  };

  ajax = function (url, successCallback, failureCallback, skipJsonParse) {
    fetch(url)
      .then(function (response) {
        if (response.ok) {
          if (skipJsonParse) {
            return response.text();
          } else {
            return response.json();
          }
        }

        throw new Error("Network response was not okay.");
      })
      .then(function (data) {
        successCallback(data);
      })
      .catch(function (error) {
        failureCallback(error);
      });
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

  chaptersGrid = function (book) {
    return htmlDiv({
      classKey: CLASS_VOLUME,
      content: htmlElement(TAG_HEADER5, book.fullName)
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
    let book = books[requestedBookId];

    if (location.hash !== "" && location.hash.length > 1) {
      ids = location.hash.slice(1).split(":");
    }

    prevChap = previousChapter(ids[1], ids[2]);
    nextChap = nextChapter(ids[1], ids[2]);

    document.getElementById(DIV_SCRIPTURES).innerHTML = chapterHtml;

    // Conditionally load a spacer between Next and Prev if it is appropriate
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

    injectBreadcrumbs(volumeForId(book.parentBookId), book, requestedChapter);
    setupMarkers();
  };

  getScripturesFailure = function () {
    document.getElementById(DIV_SCRIPTURES).innerHTML = "Unable to retrieve chapter contents.";
    injectBreadcrumbs();
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

  htmlElement = function (tagName, content, classValue) {
    let classString = "";

    if (classValue !== undefined) {
      classString = ` class="${classValue}"`;
    }

    return `<${tagName}${classString}>${content}</${tagName}>`;
  };

  htmlLink = function (parameters) {
    let classString = "";
    let contentString = "";
    let hrefString = "";
    let idString = "";
    let titleString = "";

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

    if (parameters.title !== undefined) {
      titleString = ` title="${parameters.title}"`;
    }

    return `<a${idString}${classString}${hrefString}${titleString}>${contentString}</a>`;
  };

  htmlListItem = function (content) {
    return htmlElement(TAG_LIST_ITEM, content);
  };

  htmlListItemLink = function (content, href = "") {
    return htmlListItem(htmlLink({ content, href: `#${href}` }));
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
    });
    ajax(URL_VOLUMES, function (data) {
      volumes = data;
      volumesLoaded = true;

      if (booksLoaded) {
        cacheBooks(callback);
      }
    });
  };

  // injectBreadcrumbs is a function written by Dr. Liddle
  injectBreadcrumbs = function (volume, book, chapter) {
    let crumbs = "";

    if (volume === undefined) {
      crumbs = htmlListItem(TEXT_TOP_LEVEL);
    } else {
      crumbs = htmlListItemLink(TEXT_TOP_LEVEL);

      if (book === undefined) {
        crumbs += htmlListItem(volume.fullName);
      } else {
        crumbs += htmlListItemLink(volume.fullName, volume.id);

        if (chapter === undefined || chapter <= 0) {
          crumbs += htmlListItem(book.tocName);
        } else {
          crumbs += htmlListItemLink(book.tocName, `${volume.id}:${book.id}`);
          crumbs += htmlListItem(chapter);
        }
      }
    }

    document.getElementById(DIV_BREADCRUMBS).innerHTML = htmlElement(TAG_UNORDERED_LIST, crumbs);
  };

  // Logic here was written by Dr. Liddle
  markerIndex = function (latitude, longitude) {
    let i = gmMarkers.length - 1;

    while (i >= 0) {
      let marker = gmMarkers[i];

      const latitudeDelta = Math.abs(marker.getPosition().lat() - latitude);
      const longitudeDelta = Math.abs(marker.getPosition().lng() - longitude);

      if (latitudeDelta < 0.00000001 && longitudeDelta < 0.00000001) {
        return i;
      }

      i -= 1;
    }

    return -1;
  };

  mergePlacename = function (placename, index) {
    let marker = gmMarkers[index];
    let label = gmLabels[index];
    let title = marker.getTitle();

    if (!title.includes(placename)) {
      title += ", " + placename;
      marker.setTitle(title);
      label.text = title;
    }
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
      injectBreadcrumbs(volumeForId(book.parentBookId), book);
    }
  };

  navigateChapter = function (bookId, chapter) {
    requestedBookId = bookId;
    requestedChapter = chapter;
    ajax(encodedScripturesUrlParameters(bookId, chapter), getScripturesCallback, getScripturesFailure, true);
  };

  navigateHome = function (volumeId) {
    document.getElementById(DIV_SCRIPTURES).innerHTML = htmlDiv({
      id: DIV_SCRIPTURES_NAVIGATOR,
      content: volumesGridContent(volumeId)
    });
    injectBreadcrumbs(volumeForId(volumeId));
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
    if (gmMarkers.length > 0) {
      clearMarkers();
    }

    let matches;

    document.querySelectorAll("a[onclick^=\"showLocation(\"]").forEach(function (element) {
      matches = LAT_LON_PARSER.exec(element.getAttribute("onclick"));

      if (matches) {
        let placename = matches[INDEX_PLACENAME];
        let latitude = parseFloat(matches[INDEX_LATITUDE]);
        let longitude = parseFloat(matches[INDEX_LONGITUDE]);
        let flag = matches[INDEX_FLAG];

        if (flag !== "") {
          placename = `${placename} ${flag}`;
        }

        addMarker(placename, latitude, longitude);
      }
    });

    zoomMapToFitMarkers(matches);
  };

  showLocation = function (id, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewAltitude, viewHeading) {
    console.log(id, placename, latitude, longitude, viewLatitude, viewLongitude, viewTilt, viewRoll, viewHeading);
    map.panTo({ lat: latitude, lng: longitude });
    map.setZoom(Math.round(viewAltitude / ZOOM_RATIO));
  };

  titleForBookChapter = function (book, chapter) {
    if (book !== undefined) {
      if (chapter > 0) {
        return `${book.tocName} ${chapter}`;
      }

      return book.tocName;
    }
  };

  volumeForId = function (volumeId) {
    if (volumeId !== undefined && volumeId > 0 && volumeId < volumes.length) {
      return volumes[volumeId - 1];
    }
  };

  volumesGridContent = function (volumeId) {
    let gridContent = "";

    volumes.forEach(function (volume) {
      if (volumeId === undefined || volumeId === volume.id) {
        gridContent += htmlDiv({
          classKey: CLASS_VOLUME,
          content: htmlAnchor(volume) + htmlElement(TAG_HEADER5, volume.fullName)
        });

        gridContent += booksGrid(volume);
      }
    });

    return gridContent + BOTTOM_PADDING;
  };

  zoomMapToFitMarkers = function (matches) {
    if (gmMarkers.length > 0) {
      if (gmMarkers.length === 1 && matches) {
        // When there's exactly one marker, add it and zoom to it
        let zoomLevel = Math.round(Number(matches[9]) / ZOOM_RATIO);

        if (zoomLevel < MIN_ZOOM_LEVEL) {
          zoomLevel = MIN_ZOOM_LEVEL;
        } else if (zoomLevel > MAX_ZOOM_LEVEL) {
          zoomLevel = MAX_ZOOM_LEVEL;
        }

        map.setZoom(zoomLevel);
        map.panTo(gmMarkers[0].position);
      } else {
        let bounds = new google.maps.LatLngBounds();

        gmMarkers.forEach(function (marker) {
          bounds.extend(marker.position);
        });

        map.panTo(bounds.getCenter());
        map.fitBounds(bounds);
      }
    }
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
