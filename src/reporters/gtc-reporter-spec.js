const _renderWarnings = function (warnings) {
  this.setIndent(1)
    .write(`\nWarnings (${warnings.length}):\n`);

  warnings.forEach((msg) => {
    this.setIndent(1).write(`-- \n ${msg} \n`);
  });
};

const _renderErrors = function (errs) {
  this.setIndent(3).write('\n');

  errs.forEach((err, idx) => {
    const prefix = `${idx + 1}) `;
    this.write(`\n${this.formatError(err, prefix)}\n\n`);
  });
};

const reportTaskStart = function (startTime, userAgents, testCount) {
  this.startTime = startTime;
  this.testCount = testCount;

  this.setIndent(1).useWordWrap(false).write('Running tests in:\n');

  userAgents.forEach((ua) => {
    this.write(`- ${ua}\n`);
  });
};

const reportFixtureStart = function (name) {
  this.setIndent(1).useWordWrap(false);

  if (this.afterErrorList) {
    this.afterErrorList = false;
  } else {
    this.write("\n");
  }

  this.write(`${name}\n`);
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

  this.write(title + "\n");

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

    const prefix = step.prefix ? `${step.prefix}:` : '';
    this.write(`${symbol} ${prefix} ${step.keyword}${step.text}\n`);
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
    this.write('\n');
  }

  this.setIndent(1).useWordWrap(false);

  this.write(`\n${footer}\n`);

  if (this.skipped > 0) {
    this.write(`${this.skipped} skipped\n`);
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
