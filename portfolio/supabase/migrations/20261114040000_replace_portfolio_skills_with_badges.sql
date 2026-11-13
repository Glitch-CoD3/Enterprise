begin;

delete from public.portfolio_skills;

insert into public.portfolio_skills (name, category, icon_url, sort_order, visible)
values
  ('C', 'Languages', 'https://img.shields.io/badge/C-A8B9CC?style=for-the-badge&logo=c&logoColor=white', 1, true),
  ('C++', 'Languages', 'https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=cplusplus&logoColor=white', 2, true),
  ('JavaScript', 'Languages', 'https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black', 3, true),
  ('Java', 'Languages', 'https://img.shields.io/badge/Java-1565C0?style=for-the-badge&logo=openjdk&logoColor=FFD54F&labelColor=1565C0', 4, true),
  ('Python', 'Languages', 'https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white', 5, true),
  ('React', 'Frontend', 'https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB', 6, true),
  ('Next.js', 'Frontend', 'https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white', 7, true),
  ('Tailwind CSS', 'Frontend', 'https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white', 8, true),
  ('Node.js', 'Backend', 'https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white', 9, true),
  ('Express.js', 'Backend', 'https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white', 10, true),
  ('MySQL', 'Databases', 'https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white', 11, true),
  ('MongoDB', 'Databases', 'https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white', 12, true),
  ('Docker', 'DevOps', 'https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white', 13, true),
  ('Nginx', 'DevOps', 'https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white', 14, true),
  ('Git', 'Tools', 'https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white', 15, true),
  ('GitHub', 'Tools', 'https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white', 16, true),
  ('Postman', 'Tools', 'https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white', 17, true),
  ('VS Code', 'Tools', 'https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white', 18, true),
  ('Linux', 'Tools', 'https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black', 19, true);

commit;
