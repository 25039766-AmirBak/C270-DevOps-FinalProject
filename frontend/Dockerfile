# 1. Start with Node.js
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy the rest of the frontend code
COPY . .

# 5. Compile the React code into a highly optimized, minified production build
RUN npm run build

# 6. Install 'serve', a lightweight web server meant for serving static React files
RUN npm install -g serve

# 7. Expose the port your frontend runs on
EXPOSE 3000

# 8. Start the 'serve' web server and point it at the 'build' folder on port 3000
CMD ["serve", "-s", "build", "-l", "3000"]