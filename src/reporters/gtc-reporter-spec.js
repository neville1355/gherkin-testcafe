const _renderWarnings = function (warnings) {
  this.newline()
    .setIndent(1)
    .write(`Warnings (${warnings.length}):`)
    .newline();

  warnings.forEach((msg) => {
    this.setIndent(1).write(`--`).newline().setIndent(2).write(msg).newline();
  });
};

const _renderErrors = function (errs) {
  this.setIndent(3).newline();

  errs.forEach((err, idx) => {
    const prefix = `${idx + 1}) `;
    this.newline().write(this.formatError(err, prefix)).newline().newline();
  });
};

const reportTaskStart = function (startTime, userAgents, testCount) {
  this.startTime = startTime;
  this.testCount = testCount;

  this.setIndent(1).useWordWrap(false).write('Running tests in:').newline();

  userAgents.forEach((ua) => {
    this.write(`- ${ua}`).newline();
  });
};

const reportFixtureStart = function (name) {
  this.setIndent(1).useWordWrap(false);

  if (this.afterErrorList) {
    this.afterErrorList = false;
  } else {
    this.newline();
  }

  this.write(name).newline();
};

const reportTestDone = function (name, testRunInfo, meta) {
  let hasErr = !!testRunInfo.errs.length;
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

  let title = `${symbol} ${name}`;

  this.setIndent(1).useWordWrap(false);

  if (testRunInfo.unstable) title += ' (unstable)';

  if (testRunInfo.screenshotPath) title += ` (screenshots: ${testRunInfo.screenshotPath})`;

  this.write(title);
  this.newline();

  this.setIndent(2).useWordWrap(false);
  meta.steps.forEach((step, index) => {
    let symbol;
    if (meta.failIndex < 0 || index < meta.failIndex) {
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

  this.afterErrorList = hasErr;
};

const reportTaskDone = function (endTime, passed, warnings) {
  const durationMs = endTime - this.startTime;
  const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
  let footer =
    passed === this.testCount
      ? `${this.testCount} passed`
      : `${this.testCount - passed}/${this.testCount} failed`;

  footer = footer.concat(` (${durationStr})`);

  if (!this.afterErrorList) {
    this.newline();
  }

  this.setIndent(1).useWordWrap(false);

  this.newline().write(footer).newline();

  if (this.skipped > 0) {
    this.write(`${this.skipped} skipped`).newline();
  }

  if (warnings.length) {
    this._renderWarnings(warnings);
  }
};

module.exports = () => {
  return {
    noColors: true,
    startTime: null,
    afterErrorList: false,
    testCount: 0,
    skipped: 0,
    _renderErrors,
    _renderWarnings,
    reportTaskStart,
    reportFixtureStart,
    reportTestDone,
    reportTaskDone,
  };
};
