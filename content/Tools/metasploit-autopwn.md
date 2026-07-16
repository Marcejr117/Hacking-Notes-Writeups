https://github.com/hahwul/metasploit-autopwn

![[Pasted image 20240102173239.png]]
hace los escaneos y explotación automaticamnete en realacion a los servicios que encuentra 


### 1. Clone this repo or download "db_autopwn.rb" file  

- clone this repository

```
#> git clone https://github.com/hahwul/metasploit-autopwn
```

  
or  
  

- download db_autopwn.rb file in metasploit plugin directory

```
#> wget https://raw.githubusercontent.com/hahwul/metasploit-autopwn/master/db_autopwn.rb
```

### 2. Move dB_autopwn.rb file into metasploit plugin directory

```
#> cd metasploit-autopwn
```

```
#> cp db_autopwn.rb /usr/share/metasploit-framework/plugins
```

or (install path)

```
#> cp db_autopwn.rb /opt/metasploit-framework/plugins
```