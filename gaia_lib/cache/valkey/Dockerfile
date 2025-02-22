FROM ubuntu:24.04

# Cài đặt các gói cần thiết (có thể thêm các dependency khác nếu cần)
RUN apt-get update && apt-get install -y \
    wget \
    build-essential \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy file thực thi của Valkey Server vào container
COPY valkey-server /usr/local/bin/valkey-server
RUN chmod +x /usr/local/bin/valkey-server

# Tạo thư mục chứa cấu hình (các file config sẽ được mount thông qua docker-compose nên không cần copy ở đây)
RUN mkdir -p /opt/valkey

# Expose port cho node mà bạn muốn ra ngoài (ở đây dùng node 5 làm đại diện)
EXPOSE 6379

CMD ["/usr/local/bin/valkey-server"]
