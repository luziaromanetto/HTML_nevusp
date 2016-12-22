Para utilizar está visualização é necessário manter em funcionamento o servidor
de dados que filtra os dados de acordo com o solicitado pela visualização. Para 
colocar em funcionamento o servidor de dados basta rodar o seguinte comando em python 
na pasta atual:

python server.py

algumas biblioteca são requisitos para o funcionamento da aplicação. O terminal de comandos
deverá exibir a seguinte mensagem:

[09/Dec/2016:10:13:35] ENGINE Listening for SIGHUP.
[09/Dec/2016:10:13:35] ENGINE Listening for SIGTERM.
[09/Dec/2016:10:13:35] ENGINE Listening for SIGUSR1.
[09/Dec/2016:10:13:35] ENGINE Bus STARTING
[09/Dec/2016:10:13:35] ENGINE Started monitor thread 'Autoreloader'.
[09/Dec/2016:10:13:35] ENGINE Started monitor thread '_TimeoutMonitor'.
[09/Dec/2016:10:13:35] ENGINE Serving on http://127.0.0.1:8080
[09/Dec/2016:10:13:35] ENGINE Bus STARTED

Após ter o servidor em funcionamento basta ir ao browser e acessar o seguinte endereço:

http://127.0.0.1:8080/

A atual aplicação foi testada apenas com o uso do Chrome. Para que os pontos no mapa 
sejam acessados é necessário a seleção de um padrão por coluna, para evitar ecesso de 
pontos em caso de conjuntos de dados grandes.

