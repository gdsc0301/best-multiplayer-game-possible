FROM oven/bun;

COPY . .

ENV PORT=8080

RUN bun install
RUN bun run build

EXPOSE 8080:8080
CMD [ "bun", "start" ]