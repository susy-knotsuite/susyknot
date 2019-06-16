# susyknot-config
Utility for interacting with susyknot-config.js files

### Usage
 ```javascript
const SusyknotConfig = require("susyknot-config");
```

#### Instantiate default SusyknotConfig object
 ```javascript
const newConfig = SusyknotConfig.default();
```

#### Instantiate custom SusyknotConfig object
 ```javascript
const customConfig = new SusyknotConfig("/susyknotDirPath", "/currentWorkingDirPath", networkObj);
```

#### Config.detect()
 ```javascript
// find config file & return new SusyknotConfig object with config file settings (cwd)
const susyknotConfig = SusyknotConfig.detect();

// find config file & return new SusyknotConfig object from custom working dir
const susyknotConfig = SusyknotConfig.detect({ workingDirectory: "./some/Path" });

// find & return new SusyknotConfig object from custom named config
const customSusyknotConfig = SusyknotConfig.detect({}, "./customConfig.js");
 ```
