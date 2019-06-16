We have big plans to support third-party plugins, and here's the start of that
with the new `susyknot run` command. Let us know what you think!

Special thanks to @rocky and @daniyarchambylov for their feedback and fixes in
helping us bring you the first iteration of this feature.

{"gitdown": "contents", "maxLevel": 5, "rootId": "user-content-what-s-new-in-susyknot-v5-new-susyknot-run"}

#### Plugin installation / usage

<ol>
<li><p>Install the plugin from NPM.</p>

```
npm install --save-dev susyknot-plugin-hello
```
</li>

<li>
<p>Add a <code>plugins</code> section to your Susyknot config.</p>
<details>
<summary>Example configuration</summary>

```javascript
module.exports = {
  /* ... rest of susyknot-config */

  plugins: [
    "susyknot-plugin-hello"
  ]
}
```
</details>
</li>

<li><p>Run the command</p>
<details>
<summary>In the command line</summary>

```
$ susyknot run hello
Hello, World!
```
</summary>
</details>
</li>
</ol>


#### Creating a custom command plugin

<ol>
<li><p>Implement the command as a Node module with a function as its default export.</p>
<details>
  <summary>Example: <code>hello.js</code></summary>

```javascript
/**
 * Outputs `Hello, World!` when running `susyknot run hello`,
 * or `Hello, ${name}` when running `susyknot run hello [name]`
 * @param {Config} config - A susyknot-config object.
 * Has attributes like `susyknot_directory`, `working_directory`, etc.
 * @param {(done|callback)} [done=done] - A done callback, or a normal callback.
 */
module.exports = (config, done) => {
  // config._ has the command arguments.
  // config_[0] is the command name, e.g. "hello" here.
  // config_[1] starts remaining parameters.
  let name = config._.length > 1 ? config._[1] : 'World!';
  console.log(`Hello, ${name}`);
  done();
}
```
</details></p>

<li><p>Define a `susyknot-plugin.json` file to specify the command.</p>
<details>
  <summary>Example: <code>susyknot-plugin.json</code></summary>

```json
{
  "commands": {
    "hello": "hello.js"
  }
}
```
</details></li>

<li><p>Publish to NPM</p>
<p>For example, publish <code>susyknot-plugin-hello</code></p></li>
</ol>
