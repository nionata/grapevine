# CLI

Command-line tool for interacting with a Grapevine device and the related services.

## Installation

The included build is for MacOS. Executables can be [built for different architectures](https://www.digitalocean.com/community/tutorials/how-to-build-go-executables-for-multiple-platforms-on-ubuntu-16-04) if needed. 

### _Optional_

Add the cli directory to your path, so you can reference the executable directly in your command line.

MacOS
```bash
# Get current path
pwd

# Add it to your paths file
sudo vim /etc/paths
```

## Usage

``` bash
grapevine --help
```

> If you haven't added the cli directory to your path, prepend a `./` to the above command
