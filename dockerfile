FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY 資工系畢業學分檢核系統_v1.7.html /usr/share/nginx/html/資工系畢業學分檢核系統_v1.7.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
