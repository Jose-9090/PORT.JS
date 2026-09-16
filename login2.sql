create database login;
use login;

create table usuarios(
    id int auto_increment primary key,
    nome varchar(200) not null,
    email varchar(200) not null unique,
    senha varchar(255) not null
);

select * from usuarios;