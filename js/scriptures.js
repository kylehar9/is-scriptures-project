/**
 * FILE: scriptures.js
 * 
 * Author: Kyle Harline
 * Class: IS 542
 * Section: 001
 * Assignment: HW 5
 * 
 * Description: Front-end JavaScript code for IS 542 HW 5, BYU Winter 2021.
 *
 *
 */

const Scriptures = (function () {
    "use strict";

    /*===========================================================
    *CONSTANTS */
    const URL_BASE = "https://scriptures.byu.edu/";
    const URL_BOOKS = `${URL_BASE}mapscrip/model/books.php`;
    const URL_VOLUMES = `${URL_BASE}mapscrip/model/volumes.php`;
    
    /*===========================================================
    *PRIVATE VARIABLES */
    let books;
    let volumes;

    /*===========================================================
    *PRIVATE METHOD DECLARATIONS */
    let ajax;
    let init;
    let cacheBooks;

    /*===========================================================
    *PRIVATE METHODS */
    ajax = function (url, successCallback, failureCallback) {
        let request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                // Success!
                let data = JSON.parse(this.response);

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
        volumes.forEach(volume => {
            let volumeBooks = [];
            let bookId = volume.minBookId;

            while (bookId <= volume.maxBookId) {
                volumeBooks.push(books[bookId])
                bookId += 1;
            }

            volume.books = volumeBooks; 
        })

        if (typeof callback === "function") {
            callback();
        }
    };
    init = function (callback) {
        let booksLoaded = false;
        let volumesLoaded = false;

        ajax("https://scriptures.byu.edu/mapscrip/model/books.php",
            data => {
                books = data;
                booksLoaded = true;

                if (volumesLoaded) {
                    cacheBooks(callback);
                }
            }
        );

        ajax("https://scriptures.byu.edu/mapscrip/model/volumes.php",
            data => {
                volumes = data;
                volumesLoaded = true;

                if (booksLoaded) {
                    cacheBooks(callback);
                }
            }
        );
    };
    /*===========================================================
    *PUBLIC API */


    return {
        init: init
    };
}());