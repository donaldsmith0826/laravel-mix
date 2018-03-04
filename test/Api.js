import test from 'ava';
import path from 'path';
import mix from '../src/index';
import mockFs from 'mock-fs';
import ComponentFactory from '../src/ComponentFactory';

test.beforeEach(t => {
    Config = require('../src/config')();
    Mix.tasks = [];

    new ComponentFactory().installAll();
});

test.afterEach(t => {
    mockFs.restore();
});

test('mix.js()', t => {
    let response = mix.js('resources/assets/js/app.js', 'public/js');

    t.is(mix, response);

    t.deepEqual(
        [
            {
                entry: [new File('resources/assets/js/app.js')],
                output: new File('public/js')
            }
        ],
        Config.js
    );

    mix.js(
        ['resources/assets/js/one.js', 'resources/assets/js/two.js'],
        'public/js'
    );

    t.deepEqual(
        [
            {
                entry: [new File('resources/assets/js/app.js')],
                output: new File('public/js')
            },
            {
                entry: [
                    new File('resources/assets/js/one.js'),
                    new File('resources/assets/js/two.js')
                ],
                output: new File('public/js')
            }
        ],
        Config.js
    );
});

test('mix.react()', t => {
    let response = mix.react('resources/assets/js/app.js', 'public/js');

    t.is(mix, response);

    t.deepEqual(
        [
            {
                entry: [new File('resources/assets/js/app.js')],
                output: new File('public/js')
            }
        ],
        Config.js
    );
});

test('mix.preact()', t => {
    let response = mix.preact('resources/assets/js/app.js', 'public/js');

    t.is(mix, response);

    t.deepEqual(
        [
            {
                entry: [new File('resources/assets/js/app.js')],
                output: new File('public/js')
            }
        ],
        Config.js
    );
});

test('mix.ts()', t => {
    let response = mix.ts('resources/assets/js/app.ts', 'public/js');

    t.is(mix, response);

    t.deepEqual(
        [
            {
                entry: [new File('resources/assets/js/app.ts')],
                output: new File('public/js')
            }
        ],
        Config.js
    );

    // There's also a mix.typeScript() alias.
    t.is(mix, mix.typeScript('resources/assets/js/app.ts', 'public/js'));
});

test('mix.browserSync()', t => {
    let response = mix.browserSync('app.dev');

    t.is(mix, response);
});

test('mix.version()', t => {
    let response = mix.version(['some/file.js']);

    t.is(mix, response);
    t.true(Config.versioning);

    t.deepEqual(['some/file.js'], Mix.tasks[0].data.files);
});

test('mix.version() with a folder name', t => {
    mockFs({
        'path/to/file.js': 'foo',
        'path/to/file2.js': 'foo',
        'path/to/file3.js': 'foo'
    });

    let response = mix.version('path/to');

    t.deepEqual(
        ['path/to/file.js', 'path/to/file2.js', 'path/to/file3.js'],
        Mix.tasks[0].data.files
    );
});

test('mix.disableNotifications()', t => {
    let response = mix.disableNotifications();

    t.is(mix, response);

    t.false(Config.notifications);
});

test('mix.setPublicPath()', t => {
    let response = mix.setPublicPath('somewhere/else');

    t.is(mix, response);

    t.is(path.normalize('somewhere/else'), Config.publicPath);

    // It will also trim any closing slashes.
    mix.setPublicPath('somewhere/else/');

    t.is(path.normalize('somewhere/else'), Config.publicPath);
});

test('mix.setResourceRoot()', t => {
    let response = mix.setResourceRoot('some/path');

    t.is(mix, response);

    t.is('some/path', Config.resourceRoot);
});

test('mix.webpackConfig()', t => {
    // Test config passed as an object.
    let config = { context: 'changed' };
    let response = mix.webpackConfig(config);

    t.is(mix, response);

    t.deepEqual(config, Config.webpackConfig);

    // Test config passed via a callback.
    config = { context: 'changed again' };
    response = mix.webpackConfig(webpack => config);

    t.is(mix, response);

    t.deepEqual(config, Config.webpackConfig);
});

test('mix.babelConfig()', t => {
    mix.babelConfig({
        plugins: ['some-babel-plugin']
    });

    t.true(Config.babel().plugins.includes('some-babel-plugin'));
});

test('mix.combine/scripts/styles/babel()', t => {
    t.is(mix, mix.combine([], 'public/js/combined.js'));

    t.is(1, Mix.tasks.length);

    t.is(mix, mix.scripts([], 'public/js/combined.js'));
    t.is(mix, mix.babel([], 'public/js/combined.js'));
});

test('mix.minify()', t => {
    t.is(mix, mix.minify('public/js/minify.js'));

    t.is(1, Mix.tasks.length);
});

test('mix.then()', t => {
    let called = false;

    // mix.then() registers a "build" event listener.
    let response = mix.then(() => (called = true));

    t.is(mix, response);

    // Let's fire a "build" event, and make sure that
    // our callback handler is called, as expected.
    Mix.dispatch('build');

    t.true(called);
});

test('mix.sourceMaps()', t => {
    t.false(Config.sourcemaps);

    let response = mix.sourceMaps();

    // Sourcemaps should use a sensible type as the default for dev.
    t.is(mix, response);
    t.is('eval-source-map', Config.sourcemaps);

    // For production builds, we should use a more performant type.
    Config.production = true;
    mix.sourceMaps();
    t.is('source-map', Config.sourcemaps);

    // But if the user specifies that sourcemaps shouldn't be built for
    // production, then we should disable it.
    mix.sourceMaps(false);
    t.false(Config.sourcemaps);
});

test('mix.copy()', t => {
    mix.copy('this/file.js', 'this/other/location.js');

    t.is(1, Mix.tasks.length);

    mix.copyDirectory('this/folder', 'this/other/folder');

    t.is(2, Mix.tasks.length);
});

test('mix.options()', t => {
    mix.options({
        foo: 'bar'
    });

    t.is('bar', Config.foo);
});
