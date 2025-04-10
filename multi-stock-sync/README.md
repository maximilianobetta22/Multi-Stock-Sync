# Comandos Git Básicos

Este documento contiene los comandos esenciales de Git para trabajar con commits, ramas y sincronización con el repositorio remoto.

---

## 📤 Subir cambios al repositorio remoto (Commits)

```bash
# Ver el estado de los archivos modificados
git status

# Añadir archivos específicos al área de staging
git add nombre-del-archivo.ext

# O añadir todos los cambios
git add .

# Crear un commit con un mensaje
git commit -m "Mensaje del commit"

# Subir el commit a la rama actual en el repositorio remoto
git push
```

## 🌿 Ver y cambiar de ramas

```bash
# Ver todas las ramas locales
git branch

# Ver todas las ramas (locales y remotas)
git branch -a

# Cambiar a una rama existente
git checkout nombre-de-la-rama

# Crear y cambiar a una nueva rama
git checkout -b nombre-nueva-rama
```

## 🔄 Obtener los últimos cambios del repositorio remoto

```bash
# Descargar y fusionar los cambios de la rama actual
git pull

# Si quieres asegurarte de estar en la rama correcta antes de hacer pull
git checkout nombre-de-la-rama
git pull
```

## 🧼 Tip extra: evitar conflictos

```bash
git pull origin nombre-de-la-rama
```
