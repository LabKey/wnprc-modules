# STAGE 1: Build a custom Java Runtime with jlink
FROM eclipse-temurin:25-jdk-jammy AS builder

# Create a custom JRE containing only the necessary modules for jshell and common operations.
# This makes the final image smaller and more secure.
RUN jlink \
    --add-modules java.base,java.sql,java.net.http,jdk.jshell \
    --strip-debug \
    --no-header-files \
    --no-man-pages \
    --compress=2 \
    --output /opt/jre-custom

# STAGE 2: Build the final application image
FROM ubuntu:22.04

# Copy the custom JRE from the builder stage
COPY --from=builder /opt/jre-custom /opt/jre-custom

# Configure environment for the custom JRE and other tools
ENV JAVA_HOME=/opt/jre-custom
ENV PATH="${JAVA_HOME}/bin:${PATH}"
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=en_US.utf8

# Install all OS-level dependencies in a single, optimized layer
RUN apt-get update \
    # Install initial dependencies to add new repositories
    && apt-get -qq install -y --no-install-recommends \
        lsb-release \
        software-properties-common \
        curl \
    # Add PostgreSQL repository
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /etc/apt/keyrings/pgdg.asc \
    && echo "deb [signed-by=/etc/apt/keyrings/pgdg.asc] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    # Add CRAN repository (for Ubuntu)
    && curl -fsSL https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc -o /etc/apt/keyrings/cran_ubuntu_key.asc \
    && echo "deb [signed-by=/etc/apt/keyrings/cran_ubuntu_key.asc] https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/" > /etc/apt/sources.list.d/cran.list \
    # Update package lists again and install all remaining applications
    && apt-get update \
    && apt-get -qq install -y --no-install-recommends \
        texinfo tzdata gettext make openssl dirmngr \
        libcurl4-openssl-dev libssl-dev \
        postgresql-client-15 \
        r-base r-base-dev \
    # Clean up apt cache to reduce final image size
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# install the necessary R packages
COPY install.r /tmp/install.r
RUN mkdir -p /usr/share/doc/R-4.4.1/html && Rscript /tmp/install.r

# Copy over the .netrc template file
COPY netrc /root/netrc.template

CMD ["/bin/bash", "-c", "ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && envsubst < /root/netrc.template > /root/.netrc && chmod 600 /root/.netrc && { jshell ; }"]
