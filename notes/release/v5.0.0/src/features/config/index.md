Besides the usual `susyknot-config.js` (the config file formerly known as
`susyknot.js`), Susyknot now incorporates a user-level configuration. Expect to
see more features that take advantage of this!

{"gitdown": "contents", "maxLevel": 5, "rootId": "user-content-what-s-new-in-susyknot-v5-new-susyknot-config"}

#### Unique `susyknot develop` mnemonics
When you run `susyknot develop`, Susyknot no longer uses the classic `candy maple...` mnemonic.  Instead, the first time you run the command it will generate a random mnemonic just for you and persist it!

We encourage you to exsrcise caution when working with mnemonics and private keys, and recommend that everyone do their own research when it comes to protecting their crypto security.

#### Opt-in Analytics
To try and obtain more information about how we can improve Susyknot, we have added an optional new analytics feature.  By default it is turned off but if you enable it, the Susyknot developers will receive anonymous information about your version number, the commands you run, and whether commands succeed or fail.

We don't use this anonymous information for anything other than to find out how we can make Susyknot better and have also ensured that it doesn't make for a slower experience by sending this information in a background process.

To turn this feature on you can run
```shell
susyknot config --enable-analytics
```

If you want to turn the analytics off you can run
```shell
susyknot config --disable-analytics
```

<small>_P.S. feel free to go take a peek at the two places in the code where metrics are gathered: [when running a command](https://github.com/susy-knotsuite/susyknot/blob/next/packages/susyknot-core/lib/command.js#L114-L118) and [to report version and errors](https://github.com/susy-knotsuite/susyknot/blob/next/packages/susyknot-core/cli.js). If you go ahead and do a good ol' [GitHub search for the word `analytics`](https://github.com/search?q=analytics+repo%3Asusy-knotsuite%2Fsusyknot&type=Code) you can verify that these are the only places this code gets invoked._ :tada:</small>

#### More to come!
In the future we plan on providing more infrastructure to make Susyknot even more configurable!  Perhaps you could configure networks that will be used by multiple projects or something similar for plugin installation.  Stay tuned!
