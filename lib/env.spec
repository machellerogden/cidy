#!/usr/bin/env bash

section transfersafe env

feature init-env

    scenario should initialize proper base variables

        teardown() {
            unset ENV_KEY
            unset AWS_PROFILE
            unset S3_SECRETS
        }


        setup () { ENV_KEY="gri-dev"; }
        given ENV_KEY is valid
        when init-env is called
        thenn exit with 0

        setup () { ENV_KEY="foo"; }
        given ENV_KEY is invalid
        when init-env is called
        thenn exit with 1

        setup () { ENV_KEY="gri-dev"; }
        when init-env is called
        thenn AWS_PROFILE should equal "default"

        setup () { ENV_KEY="gri-stage"; }
        when init-env is called
        thenn AWS_PROFILE should equal "default"

        setup () { ENV_KEY="gri-prod"; }
        when init-env is called
        thenn AWS_PROFILE should equal "default"

        setup () { ENV_KEY="gra-prod"; }
        when init-env is called
        thenn AWS_PROFILE should equal "gra"

        setup () { ENV_KEY="gri-dev"; }
        when init-env is called
        thenn S3_SECRETS should equal "s3://transfersafe/config/secrets.gri-dev.env"

        setup () { ENV_KEY="gri-stage"; }
        when init-env is called
        thenn S3_SECRETS should equal "s3://transfersafe/config/secrets.gri-stage.env"

        setup () { ENV_KEY="gri-prod"; }
        when init-env is called
        thenn S3_SECRETS should equal "s3://transfersafe/config/secrets.gri-prod.env"

        setup () { ENV_KEY="gra-prod"; }
        when init-env is called
        thenn S3_SECRETS should equal "s3://transfersafe-gra/config/secrets.gra-prod.env"

feature export-env

    scenario should source a file and export any variables it sets

        setup() {
            unset FOO
            unset BAR
            unset QUX
        }

        teardown() {
            unset FOO
            unset BAR
            unset QUX
        }

        given we provide a valid env file
        when export-env is called with ./scripts/test/fixture.env
        thenn FOO should equal bar

        given we provide a valid env file
        when export-env is called with ./scripts/test/fixture.env
        thenn BAR should equal baz

        given we provide a valid env file
        when export-env is called with ./scripts/test/fixture.env
        thenn QUX should equal xyzzy

    scenario should source a file and export any variables it sets to subshells

        setup() {
            export-env ./scripts/test/fixture.env
            subshell-echo() {
                echo "$(bash -c 'echo ${'$1'}')"
            }
        }

        teardown() {
            unset -f subshell-echo
            unset FOO
            unset BAR
            unset QUX
        }

        given export-env has been called with a valid env file
        when subshell-echo is called with FOO
        thenn output should match "bar"

        given export-env has been called with a valid env file
        when subshell-echo is called with BAR
        thenn output should match "baz"

        given export-env has been called with a valid env file
        when subshell-echo is called with QUX
        thenn output should match "xyzzy"

feature set-env-config

    scenario should source env file according to ENV_VAR

        setup() {
            ENV_KEY="foo"
        }

        teardown() {
            unset ENV_KEY
        }

        given ENV_KEY is foo
        when set-env-config is called
        thenn export-env should be called with ./config/config.foo.env

feature set-env-secrets

    scenario should configure aws default signature

        setup() {
            AWS_PROFILE="foo"
            S3_SECRETS="bar"
            ENV_KEY="baz"
        }

        teardown() {
            unset AWS_PROFILE
            unset S3_SECRETS
            unset ENV_KEY
        }

        given AWS_PROFILE is foo and S3_SECRETS is bar
        when set-env-secrets is called
        thenn aws should be called with configure set default.s3.signature_version s3v4

    scenario should get secrets from s3 according to AWS_PROFILE, S3_SECRETS and ENV_KEY

        setup() {
            AWS_PROFILE="foo"
            S3_SECRETS="bar"
            ENV_KEY="baz"
        }

        teardown() {
            unset AWS_PROFILE
            unset S3_SECRETS
            unset ENV_KEY
        }

        given AWS_PROFILE is foo and S3_SECRETS is bar
        when set-env-secrets is called
        thenn aws should be called with --profile foo s3 cp bar -

feature set-env-local

    scenario should source local env files

        when set-env-local is called
        thenn export-env should be called with ./config/config.local.env

        when set-env-local is called
        thenn export-env should be called with ./local.env

feature set-env-test

    scenario should source test env file

        when set-env-test is called
        thenn export-env should be called with ./config/config.test.env

feature set-env

    scenario should initialize proper base variables

        setup() {
            ENV_KEY="gri-dev"
            g4b_stub set-env-config
            g4b_stub set-env-secrets
        }

        teardown() {
            unset ENV_KEY
            g4b_restore set-env-config
            g4b_restore set-env-secrets
        }

        when set-env is called
        thenn init-env should be called

    scenario should set config

        setup() {
            g4b_stub init-env
            g4b_stub set-env-secrets
        }

        teardown() {
            g4b_restore init-env
            g4b_restore set-env-secrets
        }

        when set-env is called
        thenn set-env-config should be called

    scenario should set secrets

        setup() {
            g4b_stub init-env
            g4b_stub set-env-config
        }

        teardown() {
            g4b_restore init-env
            g4b_restore set-env-config
        }

        when set-env is called
        thenn set-env-secrets should be called

    scenario should only set local config when LOCAL is 1

        setup() {
            g4b_stub init-env
            g4b_stub set-env-config
            g4b_stub set-env-secrets
        }

        teardown() {
            g4b_restore init-env
            g4b_restore set-env-config
            g4b_restore set-env-secrets
            unset LOCAL
        }

        LOCAL=true
        given LOCAL is true
        when set-env is called
        thenn set-env-local should be called

        LOCAL=false
        given LOCAL is false
        when set-env is called
        thenn set-env-local should not be called

        LOCAL=foo
        given LOCAL is set to anything
        when set-env is called
        thenn set-env-local should not be called

        given LOCAL is not set
        when set-env is called
        thenn set-env-local should not be called
