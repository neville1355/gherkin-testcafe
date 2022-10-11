const _renderErrors = function (errs) {
  this.setIndent(3).newline();

  errs.forEach((err, idx) => {
    const prefix = `${idx + 1}) `;

    this.newline().write(this.formatError(err, prefix)).newline().newline();
  });
};

const _renderWarnings = function (warnings) {
  this.newline()
    .setIndent(1)
    .write(`Warnings (${warnings.length}):`)
    .newline();

  warnings.forEach((msg) => {
    this.setIndent(1).write(`--`).newline().setIndent(2).write(msg).newline();
  });
};

const reportTaskStart = function (startTime, userAgents, testCount) {
  this.startTime = startTime;
  this.testCount = testCount;

  this.setIndent(1).useWordWrap(false).write('Running tests in:').newline();

  userAgents.forEach((ua) => {
    this.write(`- ${ua}`).newline();
  });

  this.newline();
};

const reportFixtureStart = function (name) {
  this.currentFixtureName = name;
};

const reportTestDone = function (name, testRunInfo, meta) {
  const hasErr = !!testRunInfo.errs.length;
  let symbol = null;
  let nameStyle = null;

  if (testRunInfo.skipped) {
    this.skipped++;

    symbol = '-';
  } else if (hasErr) {
    symbol = this.symbols.err;
  } else {
    symbol = this.symbols.ok;
  }

  name = `${this.currentFixtureName} - ${name}`;

  let title = `${symbol} ${name}`;

  if (testRunInfo.unstable) {
    title = title.concat(' (unstable)');
  }

  if (testRunInfo.screenshotPath) {
    title = title.concat(` (screenshots: ${testRunInfo.screenshotPath})`);
  }

  this.setIndent(1).useWordWrap(false).write(title);

  this.setIndent(2).useWordWrap(false).newline();
  meta.steps.forEach((step, index) => {
    let symbol;
    if (index < meta.failIndex) {
      symbol = this.symbols.ok;
    } else if (index === meta.failIndex) {
      symbol = this.symbols.err;
    } else {
      symbol = '-';
    }
    this.write(symbol);
    if (step.prefix) {
      this.write(`${step.prefix}:`);
    }
    this.write(`${step.keyword}${step.text}`);
    this.newline();
  });

  if (hasErr) {
    this._renderErrors(testRunInfo.errs);
  }

  this.afterErrList = hasErr;

  this.newline();
};

const reportTaskDone = function (endTime, passed, warnings) {
  const durationMs = endTime - this.startTime;
  const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
  let footer =
    passed === this.testCount
      ? `${this.testCount} passed`
      : `${this.testCount - passed}/${this.testCount} failed`;

  footer += ` (${durationStr})`;

  this.setIndent(1).useWordWrap(false);

  if (!this.afterErrList) this.newline();

  this.newline().write(footer).newline();

  if (this.skipped > 0) {
    this.write(`${this.skipped} skipped`).newline();
  }

  if (warnings.length) this._renderWarnings(warnings);
};

module.exports = () => {
  return {
    noColors: false,
    startTime: null,
    afterErrList: false,
    currentFixtureName: null,
    testCount: 0,
    skipped: 0,
    reportTaskStart,
    reportFixtureStart,
    reportTestDone,
    reportTaskDone,
    _renderErrors,
    _renderWarnings,
  };
};
