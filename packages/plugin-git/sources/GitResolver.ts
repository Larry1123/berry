import {Resolver, ResolveOptions, MinimalResolveOptions} from '@yarnpkg/core';
import {miscUtils, structUtils}                          from '@yarnpkg/core';
import {LinkType}                                        from '@yarnpkg/core';
import {Descriptor, Locator, Manifest, Project}          from '@yarnpkg/core';

import {Hooks} from                                      './index'
import * as gitUtils                                     from './gitUtils';

export class GitResolver implements Resolver {
  #gitHandledHostedRepositoryPatterns: Array<RegExp> | undefined

  protected getHandledHostedRepositoryPatterns(project: Project) {
    if (!this.#gitHandledHostedRepositoryPatterns) {
      this.#gitHandledHostedRepositoryPatterns = []
      project.configuration.triggerHookSync((hooks: Hooks) => {
        return hooks.addHandledHostedRepository
      }, (regExp) => this.#gitHandledHostedRepositoryPatterns?.push(regExp))
    }
  }

  supportsDescriptor(descriptor: Descriptor, opts: MinimalResolveOptions) {
    this.getHandledHostedRepositoryPatterns(opts.project)
    return gitUtils.isGitUrl(descriptor.range, this.#gitHandledHostedRepositoryPatterns);
  }

  supportsLocator(locator: Locator, opts: MinimalResolveOptions) {
    this.getHandledHostedRepositoryPatterns(opts.project)
    return gitUtils.isGitUrl(locator.reference, this.#gitHandledHostedRepositoryPatterns);
  }

  shouldPersistResolution(locator: Locator, opts: MinimalResolveOptions) {
    return true;
  }

  bindDescriptor(descriptor: Descriptor, fromLocator: Locator, opts: MinimalResolveOptions) {
    return descriptor;
  }

  getResolutionDependencies(descriptor: Descriptor, opts: MinimalResolveOptions) {
    return [];
  }

  async getCandidates(descriptor: Descriptor, dependencies: unknown, opts: ResolveOptions) {
    const reference = await gitUtils.resolveUrl(descriptor.range, opts.project.configuration);
    const locator = structUtils.makeLocator(descriptor, reference);

    return [locator];
  }

  async getSatisfying(descriptor: Descriptor, references: Array<string>, opts: ResolveOptions) {
    return null;
  }

  async resolve(locator: Locator, opts: ResolveOptions) {
    if (!opts.fetchOptions)
      throw new Error(`Assertion failed: This resolver cannot be used unless a fetcher is configured`);

    const packageFetch = await opts.fetchOptions.fetcher.fetch(locator, opts.fetchOptions);

    const manifest = await miscUtils.releaseAfterUseAsync(async () => {
      return await Manifest.find(packageFetch.prefixPath, {baseFs: packageFetch.packageFs});
    }, packageFetch.releaseFs);

    return {
      ...locator,

      version: manifest.version || `0.0.0`,

      languageName: opts.project.configuration.get(`defaultLanguageName`),
      linkType: LinkType.HARD,

      dependencies: manifest.dependencies,
      peerDependencies: manifest.peerDependencies,

      dependenciesMeta: manifest.dependenciesMeta,
      peerDependenciesMeta: manifest.peerDependenciesMeta,

      bin: manifest.bin,
    };
  }
}
