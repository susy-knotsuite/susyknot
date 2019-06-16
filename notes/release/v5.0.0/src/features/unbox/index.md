There have been some changes made to the `init` and `unbox` commands.

{"gitdown": "contents", "maxLevel": 5, "rootId": "user-content-what-s-new-in-susyknot-v5-susyknot-unbox"}

#### Prompt to overwrite files

To avoid accidentally overwriting files, in the past Susyknot would not allow you to unbox or init in a directory that was not empty.  With version 5, Susyknot allows you to do so.  When it finds files that have name conflicts with the files being copied, it will prompt you for each conflict and ask if you want to overwrite the existing files!


#### `--force`

If you don't want to deal with the prompts and know what you are doing, you can now also just bypass the prompting stage.  You can do this by using a `--force` option.  If you use this option, Susyknot automatically overwrites any files that have name conflicts with the files being copied.  Make sure you are careful when using this option so you don't overwrite anything you want to keep!


#### Unbox from a branch or a subdirectory

One last thing that has been changed with these commands is the ability to unbox from a branch or subdirectory.  Now you can unbox projects in the following formats:
```shell
susyknot unbox https://github.com/susyknot-box/bare-box#remote-branch-on-github
susyknot unbox git@github.com:susyknot-box/bare-box#susyweb-one:directory/subDirectory
```
