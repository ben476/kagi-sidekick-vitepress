import { Plugin } from "vite";
const fs = require("fs");
const path = require("path");
const { readdir } = require("fs").promises;
import { IndexSearch } from "./md-index-builder";

export interface Options {
  // add plugin options here
}

export interface myModule {
  PREVIEW_LOOKUP: string;
  LUNR_DATA: string;
}

const DEFAULT_OPTIONS: Options = {
  // set default values
  //TODO: Add index options like preview size
};

export function SearchPlugin(inlineOptions?: Partial<Options>): Plugin {
  // eslint-disable-next-line no-unused-vars
  const options = {
    ...DEFAULT_OPTIONS,
    ...inlineOptions,
  };

  let config: any;
  const virtualModuleId = "virtual:my-module";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "vite-plugin-search",
    enforce: "pre",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    config: () => ({
      resolve: {
        alias: { "./VPNavBarSearch.vue": "vitepress-plugin-search/Search.vue" },
      },
    }),

    async resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(this, id) {
      if (id === resolvedVirtualModuleId) {
        if (!config.build.ssr) {
          //so we don't compute index search twice
          let index = await IndexSearch(config.root);
          return index;
        }
        return `const LUNR_DATA = { "version": "2.3.9", "fields": ["b", "a"], "fieldVectors": [], "invertedIndex": [], "pipeline": ["stemmer"] };
				const PREVIEW_LOOKUP = {};
				const data = { LUNR_DATA, PREVIEW_LOOKUP };
				export default data;`;
      }
    },
  };
}
