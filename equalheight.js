/*!
 * equalheight.js
 * https://github.com/Focus-Flow/equalheight.js
 *
 * A javascript library to make elements on same row equal in height.
 *
 * @version 1.0.0
 * @date    2015-11-18
 *
 * @license
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Focus Flow Oy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

(function ($) {
  'use strict';

  // This is adapted from http://codepen.io/micahgodbolt/pen/FgqLc
  var EqualHeight = function (selector) {
    this.selector = selector;
    this.$elements = $(this.selector);
    this.rows = [];
    this.init();
  };

  EqualHeight.prototype = {
    init: function () {
      EqualHeight.instances.push(this);
      this.update();
    },

    preReadWriter: function () {
      this.$elements.css({
        height: 'auto',
        clear: ''
      });
    },

    reader: function () {
      var that, $el, topPosition, currentRowStart, rowsIndex, currentRow;
      that = this;
      that.rows = [];
      topPosition = 0;
      currentRowStart = 0;
      rowsIndex = 0;
      currentRow = null;

      that.$elements.each(function () {
        $el = $(this);
        if (!$el.is(':visible')) {
          return;
        }
        topPosition = $el.offset().top;
        if (currentRowStart != topPosition) {
          // TODO: This row should somehow be moved to a seperate writer. Now
          // we end up writing in midst of reading...
          $el.css({ clear: $el.css('float') });
          topPosition = $el.offset().top;
          that.rows.push({
            topPosition: topPosition,
            maxHeight: $el.height(),
            items: [$el]
          });
          rowsIndex++;
          currentRowStart = topPosition;
        } else {
          currentRow = that.rows[rowsIndex - 1];
          currentRow.maxHeight = Math.max($el.height(), currentRow.maxHeight);
          currentRow.items.push($el);
        }
      });
    },

    writer: function () {
      var rowsCount, rowsIndex, currentRow, itemCount, itemIndex;
      rowsCount = this.rows.length;
      rowsIndex = 0;
      currentRow = null;
      itemCount = 0;
      itemIndex = 0;

      for (rowsIndex = 0; rowsIndex < rowsCount; rowsIndex++) {
        currentRow = this.rows[rowsIndex];
        itemCount = currentRow.items.length;
        for (itemIndex = 0; itemIndex < itemCount; itemIndex++) {
          currentRow.items[itemIndex].height(currentRow.maxHeight);
        }
      }
    },

    update: function () {
      this.preReadWriter();
      this.reader();
      this.writer();
    }
  };

  EqualHeight.instances = [];

  EqualHeight.$window = $(window);

  EqualHeight.windowSize = {
    width: null,
    height: null
  };

  EqualHeight.updateWindowSize = function () {
    EqualHeight.windowSize.width = EqualHeight.$window.width();
    EqualHeight.windowSize.height = EqualHeight.$window.height();
  };

  EqualHeight.listener = function () {
    EqualHeight.updateWindowSize();
    $.each(EqualHeight.instances, function (index, instance) {
      instance.preReadWriter();
    });
    $.each(EqualHeight.instances, function (index, instance) {
      instance.reader();
    });
    $.each(EqualHeight.instances, function (index, instance) {
      instance.writer();
    });
  };

  EqualHeight.$window.resize(EqualHeight.listener);

  window.equalheight = function (selector) {
    return new EqualHeight(selector);
  };
})(jQuery);
