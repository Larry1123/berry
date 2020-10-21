import * as gitUtils from './gitUtils';

const VALID_PATTERNS = [
  `https://github.com/TooTallNate/util-deprecate.git#v1.0.0`,
  `https://github.com/TooTallNate/util-deprecate.git#semver:v1.0.0`,
  `https://github.com/TooTallNate/util-deprecate.git#master`,
  `https://github.com/TooTallNate/util-deprecate.git#b3562c2798507869edb767da869cd7b85487726d`,
  `git://github.com/TooTallNate/util-deprecate.git#v1.0.1`,
  `git+ssh://git@github.com/TooTallNate/util-deprecate.git#v1.0.1`,
  `ssh://git@github.com/TooTallNate/util-deprecate.git#v1.0.1`,
  `git+ssh://git@github.com:yarnpkg/berry.git#v2.1.1`,
  `ssh://git@github.com:yarnpkg/berry.git#v2.1.1`,
  `git+https://github.com/TooTallNate/util-deprecate#v1.0.1`,
  `git+https://github.com/TooTallNate/util-deprecate.git#v1.0.1`,
];

const INVALID_PATTERNS = [
  `./.`,
  `../..`,
];

describe(`gitUtils`, () => {
  for (const pattern of VALID_PATTERNS) {
    it(`should detect ${pattern} as a valid Git url`, () => {
      expect(gitUtils.isGitUrl(pattern)).toEqual(true);
    });
  }

  for (const pattern of INVALID_PATTERNS) {
    it(`shouldn't detect ${pattern} as a valid Git url`, () => {
      expect(gitUtils.isGitUrl(pattern)).toEqual(false);
    });
  }

  for (const pattern of VALID_PATTERNS) {
    it(`should properly normalize ${pattern} ({ git: false })`, () => {
      expect(gitUtils.normalizeRepoUrl(pattern)).toMatchSnapshot();
    });
    it(`should properly normalize ${pattern} ({ git: true })`, () => {
      expect(gitUtils.normalizeRepoUrl(pattern, {git: true})).toMatchSnapshot();
    });
  }

  for (const pattern of VALID_PATTERNS) {
    it(`should properly split ${pattern}`, () => {
      expect(gitUtils.splitRepoUrl(pattern)).toMatchSnapshot();
    });
  }
});
