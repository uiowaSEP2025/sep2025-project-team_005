# Use official Node.js image
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

RUN npm run build
# Expose port 3000 for the React dev server
EXPOSE 3000

# Start the React app
CMD ["npm", "start"]
