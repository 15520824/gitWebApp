/* eslint-disable no-undef */
/* Work in progress */

/**
Sudoku game
*/

import './style.css';

function Sudoku(params) {
  var t = this;

  this.INIT = 0;
  this.RUNNING = 1;
  this.END = 2;

  this.id = params.id || 'sudoku_container';
  this.displaySolution = params.displaySolution || 0;
  this.displaySolutionOnly = params.displaySolutionOnly || 0;
  this.displayTitle = params.displayTitle || 0;
  this.highlight = params.highlight || 0;
  this.fixCellsNr = params.fixCellsNr || 32;
  this.n = 3;
  this.nn = this.n * this.n;
  this.cellsNr = this.nn * this.nn;

  if (this.fixCellsNr < 10) {
    this.fixCellsNr = 10;
  }
  if (this.fixCellsNr > 70) {
    this.fixCellsNr = 70;
  }

  this.init();

  //counter
  setInterval(function() {
    t.timer();
  }, 1000);

  return this;
}

Sudoku.prototype.init = function() {
  this.status = this.INIT;
  this.cellsComplete = 0;
  this.board = [];
  this.boardSolution = [];
  this.cell = null;
  this.markNotes = 0;
  this.secondsElapsed = 0;

  if (this.displayTitle == 0) {
    $('#sudoku_title').hide();
  }

  this.board = this.boardGenerator(this.n, this.fixCellsNr);

  return this;
};

Sudoku.prototype.timer = function() {
  if (this.status === this.RUNNING) {
    this.secondsElapsed++;
    $('.time').text('' + this.secondsElapsed);
  }
};

/**
  Shuffle array
  */
Sudoku.prototype.shuffle = function(array) {
  var currentIndex = array.length,
    temporaryValue = 0,
    randomIndex = 0;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

/**
  Generate the sudoku board
  */
Sudoku.prototype.boardGenerator = function(n, fixCellsNr) {
  this.boardSolution = [];
  this.board_init = [];
  for (var i = 0; i < this.nn; i++) {
    this.boardSolution[i] = [];
    for (var j = 0; j < this.nn; j++) {
      this.boardSolution[i][j] = 0;
    }
  }

  return this.board_init;
};

/**
  Draw sudoku board in the specified container
  */
Sudoku.prototype.drawBoard = function() {
  var index = 0,
    position = {x: 0, y: 0},
    group_position = {x: 0, y: 0};

  var sudoku_board = $('<div></div>').addClass('sudoku_board');
  var sudoku_statistics = $('<div></div>')
    .addClass('statistics')
    .html(
      '<b>Cells:</b> <span class="cells_complete">' +
        this.cellsComplete +
        '/' +
        this.cellsNr +
        '</span> <b>Time:</b> <span class="time">' +
        this.secondsElapsed +
        '</span>',
    );

  $('#' + this.id).empty();

  //draw board
  for (i = 0; i < this.nn; i++) {
    for (j = 0; j < this.nn; j++) {
      position = {x: i + 1, y: j + 1};
      group_position = {
        x: Math.floor((position.x - 1) / this.n),
        y: Math.floor((position.y - 1) / this.n),
      };

      var value = this.board[index] > 0 ? this.board[index] : '',
        value_solution =
          this.board_init[index] > 0 ? this.board_init[index] : '',
        cell = $('<div></div>')
          .attr('id', index)
          .addClass('cell')
          .attr('x', position.x)
          .attr('y', position.y)
          .attr('gr', group_position.x + '' + group_position.y)
          .html('<span>' + value + '</span>');

      if (this.displaySolution) {
        $('<span class="solution">(' + value_solution + ')</span>').appendTo(
          cell,
        );
      }

      if (value > 0) {
        cell.addClass('fix');
      }

      if (position.x % this.n === 0 && position.x != this.nn) {
        cell.addClass('border_h');
      }

      if (position.y % this.n === 0 && position.y != this.nn) {
        cell.addClass('border_v');
      }

      cell.appendTo(sudoku_board);
      index++;
    }
  }

  sudoku_board.appendTo('#' + this.id);

  //draw console
  var sudoku_console_cotainer = $('<div></div>').addClass(
    'board_console_container',
  );
  var sudoku_console = $('<div></div>').addClass('board_console');

  for (i = 1; i <= this.nn; i++) {
    $('<div></div>')
      .addClass('num')
      .text(i)
      .appendTo(sudoku_console);
  }
  $('<div></div>')
    .addClass('num remove')
    .text('X')
    .appendTo(sudoku_console);
  $('<div></div>')
    .addClass('num note')
    .text('?')
    .appendTo(sudoku_console);

  //draw gameover
  var sudoku_gameover = $(
    '<div class="gameover_container"><div class="gameover">Congratulation! <button class="restart" id="agian">Play Again</button></div></div>',
  );

  //add all to sudoku container
  sudoku_console_cotainer.appendTo('#' + this.id).hide();
  sudoku_console.appendTo(sudoku_console_cotainer);
  sudoku_statistics.appendTo('#' + this.id);
  sudoku_gameover.appendTo('#' + this.id).hide();

  //adjust size
  this.resizeWindow();
};
Sudoku.prototype.ShowResult = function() {
  console.log('show');
  var index = 0;
  var r = solve_sudoku(this.boardSolution);
  if (r > 0) {
    for (var i = 0; i < this.nn; i++) {
      for (var j = 0; j < this.nn; j++) {
        this.cell = document.getElementById(index);
        this.addValueResult(this.boardSolution[i][j]);
        index++;
      }
    }
  } else {
    alert('No Solution');
  }
};
Sudoku.prototype.resizeWindow = function() {
  console.time('resizeWindow');

  var screen = {w: $(window).width(), h: $(window).height()};

  //adjust the board
  var b_pos = $('#' + this.id + ' .sudoku_board').offset(),
    b_dim = {
      w: $('#' + this.id + ' .sudoku_board').width(),
      h: $('#' + this.id + ' .sudoku_board').height(),
    },
    s_dim = {
      w: $('#' + this.id + ' .statistics').width(),
      h: $('#' + this.id + ' .statistics').height(),
    };

  var screen_wr = screen.w + s_dim.h + b_pos.top + 10;

  if (screen_wr > screen.h) {
    $('#' + this.id + ' .sudoku_board').css(
      'width',
      screen.h - b_pos.top - s_dim.h - 14,
    );
    $('#' + this.id + ' .board_console').css('width', b_dim.h / 2);
  } else {
    $('#' + this.id + ' .sudoku_board').css('width', '98%');
    $('#' + this.id + ' .board_console').css('width', '50%');
  }

  var cell_width = $('#' + this.id + ' .sudoku_board .cell:first').width(),
    note_with = Math.floor(cell_width / 2) - 1;

  $('#' + this.id + ' .sudoku_board .cell').height(cell_width);
  $('#' + this.id + ' .sudoku_board .cell span').css(
    'line-height',
    cell_width + 'px',
  );
  $('#' + this.id + ' .sudoku_board .cell .note').css({
    'line-height': note_with + 'px',
    width: note_with,
    height: note_with,
  });

  //adjust the console
  var console_cell_width = $(
    '#' + this.id + ' .board_console .num:first',
  ).width();
  $('#' + this.id + ' .board_console .num').css('height', console_cell_width);
  $('#' + this.id + ' .board_console .num').css(
    'line-height',
    console_cell_width + 'px',
  );

  //adjust console
  b_dim = {
    w: $('#' + this.id + ' .sudoku_board').width(),
    h: $('#' + this.id + ' .sudoku_board').width(),
  };
  b_pos = $('#' + this.id + ' .sudoku_board').offset();
  c_dim = {
    w: $('#' + this.id + ' .board_console').width(),
    h: $('#' + this.id + ' .board_console').height(),
  };

  var c_pos_new = {
    left: b_dim.w / 2 - c_dim.w / 2 + b_pos.left,
    top: b_dim.h / 2 - c_dim.h / 2 + b_pos.top,
  };
  $('#' + this.id + ' .board_console').css({
    left: c_pos_new.left,
    top: c_pos_new.top,
  });

  //adjust the gameover container
  var gameover_pos_new = {left: screen.w / 20, top: screen.w / 20 + b_pos.top};

  $('#' + this.id + ' .gameover').css({
    left: gameover_pos_new.left,
    top: gameover_pos_new.top,
  });

  console.log('screen', screen);
  console.timeEnd('resizeWindow');
};

/**
  Show console
  */
Sudoku.prototype.showConsole = function(cell) {
  $('#' + this.id + ' .board_console_container').show();

  var t = this,
    oldNotes = $(this.cell).find('.note');

  //init
  $('#' + t.id + ' .board_console .num').removeClass('selected');

  //mark buttons
  if (t.markNotes) {
    //select markNote button
    $('#' + t.id + ' .board_console .num.note').addClass('selected');

    //select buttons
    $.each(oldNotes, function() {
      var noteNum = $(this).text();
      $('#' + t.id + ' .board_console .num:contains(' + noteNum + ')').addClass(
        'selected',
      );
    });
  }

  return this;
};

/**
  Hide console
  */
Sudoku.prototype.hideConsole = function(cell) {
  $('#' + this.id + ' .board_console_container').hide();
  return this;
};

/**
  Select cell and prepare it for input from sudoku board console
  */
Sudoku.prototype.cellSelect = function(cell) {
  this.cell = cell;

  var value = $(cell).text() | 0,
    position = {x: $(cell).attr('x'), y: $(cell).attr('y')},
    group_position = {
      x: Math.floor((position.x - 1) / 3),
      y: Math.floor((position.y - 1) / 3),
    },
    horizontal_cells = $(
      '#' + this.id + ' .sudoku_board .cell[x="' + position.x + '"]',
    ),
    vertical_cells = $(
      '#' + this.id + ' .sudoku_board .cell[y="' + position.y + '"]',
    ),
    group_cells = $(
      '#' +
        this.id +
        ' .sudoku_board .cell[gr="' +
        group_position.x +
        '' +
        group_position.y +
        '"]',
    ),
    same_value_cells = $(
      '#' + this.id + ' .sudoku_board .cell span:contains(' + value + ')',
    );

  //remove all other selections
  $('#' + this.id + ' .sudoku_board .cell').removeClass(
    'selected current group',
  );
  $('#' + this.id + ' .sudoku_board .cell span').removeClass('samevalue');
  //select current cell
  $(cell).addClass('selected current');

  //highlight select cells
  // if (this.highlight > 0) {
  //     horizontal_cells.addClass('selected');
  //     vertical_cells.addClass('selected');
  //     group_cells.addClass('selected group');
  //     same_value_cells.not( $(cell).find('span') ).addClass('samevalue');
  // }

  if ($(this.cell).hasClass('fix')) {
    $('#' + this.id + ' .board_console .num').addClass('no');
  } else {
    $('#' + this.id + ' .board_console .num').removeClass('no');

    this.showConsole();
    this.resizeWindow();
  }
};

/**
  Add value from sudoku console to selected board cell
  */
Sudoku.prototype.addValueResult = function(value) {
  console.log('prepare for addValue', value);

  var position = {x: $(this.cell).attr('x'), y: $(this.cell).attr('y')},
    group_position = {
      x: Math.floor((position.x - 1) / 3),
      y: Math.floor((position.y - 1) / 3),
    },
    horizontal_cells =
      '#' + this.id + ' .sudoku_board .cell[x="' + position.x + '"]',
    vertical_cells =
      '#' + this.id + ' .sudoku_board .cell[y="' + position.y + '"]',
    group_cells =
      '#' +
      this.id +
      ' .sudoku_board .cell[gr="' +
      group_position.x +
      '' +
      group_position.y +
      '"]',
    horizontal_cells_exists = $(
      horizontal_cells + ' span:contains(' + value + ')',
    ),
    vertical_cells_exists = $(vertical_cells + ' span:contains(' + value + ')'),
    group_cells_exists = $(group_cells + ' span:contains(' + value + ')'),
    horizontal_notes = horizontal_cells + ' .note:contains(' + value + ')',
    vertical_notes = vertical_cells + ' .note:contains(' + value + ')',
    group_notes = group_cells + ' .note:contains(' + value + ')',
    old_value =
      parseInt(
        $(this.cell)
          .not('.notvalid')
          .text(),
      ) || 0;

  //delete value or write it in cell
  $(this.cell)
    .find('span')
    .text(value);

  //add value
  $(this.cell).removeClass('notvalid');
  console.log('Value added ', value);
  //remove all notes from current cell,  line column and group
  $(horizontal_notes).remove();
  $(vertical_notes).remove();
  $(group_notes).remove();

  $('#' + this.id + ' .statistics .cells_complete').text(
    '' + this.cellsComplete + '/' + this.cellsNr,
  );

  return this;
};
Sudoku.prototype.addValue = function(value) {
  console.log('prepare for addValue', value);
  console.log(this.cell);
  var position = {x: $(this.cell).attr('x'), y: $(this.cell).attr('y')},
    group_position = {
      x: Math.floor((position.x - 1) / 3),
      y: Math.floor((position.y - 1) / 3),
    },
    horizontal_cells =
      '#' + this.id + ' .sudoku_board .cell[x="' + position.x + '"]',
    vertical_cells =
      '#' + this.id + ' .sudoku_board .cell[y="' + position.y + '"]',
    group_cells =
      '#' +
      this.id +
      ' .sudoku_board .cell[gr="' +
      group_position.x +
      '' +
      group_position.y +
      '"]',
    horizontal_cells_exists = $(
      horizontal_cells + ' span:contains(' + value + ')',
    ),
    vertical_cells_exists = $(vertical_cells + ' span:contains(' + value + ')'),
    group_cells_exists = $(group_cells + ' span:contains(' + value + ')'),
    horizontal_notes = horizontal_cells + ' .note:contains(' + value + ')',
    vertical_notes = vertical_cells + ' .note:contains(' + value + ')',
    group_notes = group_cells + ' .note:contains(' + value + ')',
    old_value =
      parseInt(
        $(this.cell)
          .not('.notvalid')
          .text(),
      ) || 0;

  if ($(this.cell).hasClass('fix')) {
    return;
  }

  //delete value or write it in cell
  $(this.cell)
    .find('span')
    .text(value === 0 ? '' : value);

  if (
    this.cell !== null &&
    (horizontal_cells_exists.length ||
      vertical_cells_exists.length ||
      group_cells_exists.length)
  ) {
    if (old_value !== value) {
      $(this.cell).addClass('notvalid');
    } else {
      $(this.cell)
        .find('span')
        .text('');
    }
  } else {
    //add value
    $(this.cell).removeClass('notvalid');
    console.log('Value added ', value);
    this.boardSolution[position.x - 1][position.y - 1] = value;
    //remove all notes from current cell,  line column and group
    $(horizontal_notes).remove();
    $(vertical_notes).remove();
    $(group_notes).remove();
  }
  console.log(this.boardSolution);
  //recalculate completed cells
  this.cellsComplete = $(
    '#' + this.id + ' .sudoku_board .cell:not(.notvalid) span:not(:empty)',
  ).length;
  console.log(
    'is game over? ',
    this.cellsComplete,
    this.cellsNr,
    this.cellsComplete === this.cellsNr,
  );
  //game over
  if (this.cellsComplete === this.cellsNr) {
    this.gameOver();
  }

  $('#' + this.id + ' .statistics .cells_complete').text(
    '' + this.cellsComplete + '/' + this.cellsNr,
  );

  return this;
};
function dlx_cover(c) {
  c.right.left = c.left;
  c.left.right = c.right;
  for (var i = c.down; i != c; i = i.down) {
    for (var j = i.right; j != i; j = j.right) {
      j.down.up = j.up;
      j.up.down = j.down;
      j.column.size--;
    }
  }
}

function dlx_uncover(c) {
  for (var i = c.up; i != c; i = i.up) {
    for (var j = i.left; j != i; j = j.left) {
      j.column.size++;
      j.down.up = j;
      j.up.down = j;
    }
  }
  c.right.left = c;
  c.left.right = c;
}

function dlx_search(head, solution, k, solutions, maxsolutions) {
  if (head.right == head) {
    solutions.push(solution.slice(0));
    console.log(solution);
    if (solutions.length >= maxsolutions) {
      return solutions;
    }
    return null;
  }
  var c = null;
  var s = 99999;
  for (var j = head.right; j != head; j = j.right) {
    if (j.size == 0) {
      return null;
    }
    if (j.size < s) {
      s = j.size;
      c = j;
    }
  }
  dlx_cover(c);
  for (var r = c.down; r != c; r = r.down) {
    solution[k] = r.row;
    for (var j = r.right; j != r; j = j.right) {
      dlx_cover(j.column);
    }
    var s = dlx_search(head, solution, k + 1, solutions, maxsolutions);
    if (s != null) {
      return s;
    }
    for (var j = r.left; j != r; j = j.left) {
      dlx_uncover(j.column);
    }
  }
  dlx_uncover(c);
  return null;
}

function dlx_solve(matrix, skip, maxsolutions) {
  var columns = new Array(matrix[0].length);
  for (var i = 0; i < columns.length; i++) {
    columns[i] = new Object();
  }
  for (var i = 0; i < columns.length; i++) {
    columns[i].index = i;
    columns[i].up = columns[i];
    columns[i].down = columns[i];
    if (i >= skip) {
      if (i - 1 >= skip) {
        columns[i].left = columns[i - 1];
      }
      if (i + 1 < columns.length) {
        columns[i].right = columns[i + 1];
      }
    } else {
      columns[i].left = columns[i];
      columns[i].right = columns[i];
    }
    columns[i].size = 0;
  }
  for (var i = 0; i < matrix.length; i++) {
    var last = null;
    for (var j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j]) {
        var node = new Object();
        node.row = i;
        node.column = columns[j];
        node.up = columns[j].up;
        node.down = columns[j];
        if (last) {
          node.left = last;
          node.right = last.right;
          last.right.left = node;
          last.right = node;
        } else {
          node.left = node;
          node.right = node;
        }
        columns[j].up.down = node;
        columns[j].up = node;
        columns[j].size++;
        last = node;
      }
    }
  }
  var head = new Object();
  head.right = columns[skip];
  head.left = columns[columns.length - 1];
  columns[skip].left = head;
  columns[columns.length - 1].right = head;
  solutions = [];
  dlx_search(head, [], 0, solutions, maxsolutions);
  return solutions;
}

function solve_sudoku(grid) {
  var mat = [];
  var rinfo = [];
  for (var i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      var g = grid[i][j] - 1;
      if (g >= 0) {
        var row = new Array(324);
        row[i * 9 + j] = 1;
        row[9 * 9 + i * 9 + g] = 1;
        row[9 * 9 * 2 + j * 9 + g] = 1;
        row[
          9 * 9 * 3 + (Math.floor(i / 3) * 3 + Math.floor(j / 3)) * 9 + g
        ] = 1;
        mat.push(row);
        rinfo.push({row: i, col: j, n: g + 1});
      } else {
        for (var n = 0; n < 9; n++) {
          var row = new Array(324);
          row[i * 9 + j] = 1;
          row[9 * 9 + i * 9 + n] = 1;
          row[9 * 9 * 2 + j * 9 + n] = 1;
          row[
            9 * 9 * 3 + (Math.floor(i / 3) * 3 + Math.floor(j / 3)) * 9 + n
          ] = 1;
          mat.push(row);
          rinfo.push({row: i, col: j, n: n + 1});
        }
      }
    }
  }
  var solutions = dlx_solve(mat, 0, 1);

  if (solutions.length > 0) {
    var r = solutions[0];
    for (var i = 0; i < r.length; i++) {
      grid[rinfo[r[i]].row][rinfo[r[i]].col] = rinfo[r[i]].n;
    }
    return solutions.length;
  }
  return 0;
}

/**
  Add note from sudoku console to selected board cell
  */
Sudoku.prototype.addNote = function(value) {
  console.log('addNote', value);

  var t = this,
    oldNotes = $(t.cell).find('.note'),
    note_width = Math.floor($(t.cell).width() / 2);

  //add note to cell
  if (oldNotes.length < 4) {
    $('<div></div>')
      .addClass('note')
      .css({
        'line-height': note_width + 'px',
        height: note_width - 1,
        width: note_width - 1,
      })
      .text(value)
      .appendTo(this.cell);
  }

  return this;
};

/**
  Remove note from sudoku console to selected board cell
  */
Sudoku.prototype.removeNote = function(value) {
  if (value === 0) {
    $(this.cell)
      .find('.note')
      .remove();
  } else {
    $(this.cell)
      .find('.note:contains(' + value + ')')
      .remove();
  }

  return this;
};

/**
  End game routine
  */
Sudoku.prototype.gameOver = function() {
  console.log('GAME OVER!');
  this.status = this.END;

  $('#' + this.id + ' .gameover_container').show();
};

/**
  Run a new sudoku game
  */
Sudoku.prototype.run = function() {
  this.status = this.RUNNING;

  var t = this;
  this.drawBoard();

  //click on board cell
  $('#' + this.id + ' .sudoku_board .cell').on('click', function(e) {
    t.cellSelect(this);
  });

  //click on console num
  $('#' + this.id + ' .board_console .num').on('click', function(e) {
    var value = $.isNumeric($(this).text()) ? parseInt($(this).text()) : 0,
      clickMarkNotes = $(this).hasClass('note'),
      clickRemove = $(this).hasClass('remove'),
      numSelected = $(this).hasClass('selected');

    if (clickMarkNotes) {
      console.log('clickMarkNotes');
      t.markNotes = !t.markNotes;

      if (t.markNotes) {
        $(this).addClass('selected');
      } else {
        $(this).removeClass('selected');
        t.removeNote(0).showConsole();
      }
    } else {
      if (t.markNotes) {
        if (!numSelected) {
          if (!value) {
            t.removeNote(0).hideConsole();
          } else {
            t.addValue(0)
              .addNote(value)
              .hideConsole();
          }
        } else {
          t.removeNote(value).hideConsole();
        }
      } else {
        t.removeNote(0)
          .addValue(value)
          .hideConsole();
      }
    }
  });

  //click outer console
  $('#' + this.id + ' .board_console_container').on('click', function(e) {
    if ($(e.target).is('.board_console_container')) {
      $(this).hide();
    }
  });

  $(window).resize(function() {
    t.resizeWindow();
  });
};

//main
$(function() {
  console.time('loading time');

  //init
  $('head').append(
    '<meta name="viewport" content="initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,width=device-width,height=device-height,target-densitydpi=device-dpi,user-scalable=yes" />',
  );

  //game
  var game = new Sudoku({
    id: 'sudoku_container',
    fixCellsNr: 30,
    highlight: 1,
    displayTitle: 1,
    //displaySolution: 1,
    //displaySolutionOnly: 1,
  });

  game.run();

  $('#sidebar-toggle').on('click', function(e) {
    $('#sudoku_menu').toggleClass('open-sidebar');
  });

  //restart game
  $('#sudoku_menu #restart').on('click', function() {
    game.init().run();
    $('#sudoku_menu').removeClass('open-sidebar');
  });
  $('.gameover #agian').on('click', function() {
    game.init().run();
    $('#sudoku_menu').removeClass('open-sidebar');
  });

  $('#sudoku_menu #show').on('click', function() {
    game.ShowResult();
    $('#sudoku_menu').toggleClass('open-sidebar');
  });

  console.timeEnd('loading time');
});
