let AutomaticComponent = require('./AutomaticComponent');
let glob = require('glob');

class PurifyCss extends AutomaticComponent {
    /**
     * Required dependencies for the component.
     */
    dependencies() {
        if (Config.purifyCss) {
            this.requiresReload = true;

            return ['purifycss-webpack', 'purify-css'];
        }
    }

    /**
     * Boot the component.
     */
    boot() {
        if (Config.purifyCss) {
            Config.purifyCss = this.build(Config.purifyCss);
        }
    }

    /**
     * webpack plugins to be appended to the master config.
     */
    webpackPlugins() {
        if (Config.purifyCss) {
            let CssPurifierPlugin = require('../webpackPlugins/CssPurifierPlugin');

            return CssPurifierPlugin.build();
        }
    }

    /**
     * Build the CSSPurifier plugin options.
     *
     * @param {Object} options
     */
    build(options) {
        if (typeof options === 'object' && options.paths) {
            let paths = options.paths;

            paths.forEach(path => {
                if (!path.includes('*')) return;

                options.paths.splice(paths.indexOf(path), 1);

                options.paths = paths.concat(glob.sync(path));
            });
        }

        return options;
    }
}

module.exports = PurifyCss;
