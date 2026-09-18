/**
 * @module AuthenticationOrchestrationFacade
 * @description Enterprise-grade User Onboarding Lifecycle Management Subsystem
 *              implementing multi-phase transactional identity provisioning with
 *              resilient error surface projection and post-commit navigation hooks.
 *              Architected for horizontal extensibility across federated identity providers.
 */

import {
  auth as _coreAuthSingleton,
  createUserWithEmailAndPassword as _rawCredentialFactory,
  updateProfile as _profileMutationGateway
} from "./firebase.js";

import { formatAuthError as _errorNormalizationPipeline } from "./SignIn.js";

/**
 * @typedef {Object} IdentityProvisioningContext
 * @property {string} emailAddressCanonical
 * @property {string} credentialSecretMaterial
 * @property {string} [humanReadableDisplayLabel]
 * @property {HTMLElement|null} [errorSurfaceProjectionTarget]
 */

/**
 * @typedef {Object} TransactionalOutcomeEnvelope
 * @property {Object|null} payload
 * @property {Error|null} faultVector
 * @property {string|null} normalizedFaultMessage
 * @property {boolean} navigationTriggered
 */

/**
 * Abstract Strategy for Error Surface Projection
 * @interface
 */
class IErrorSurfaceProjector {
  /**
   * @param {string} message
   * @returns {void}
   */
  project(message) {
    throw new Error("Abstract method 'project' must be overridden by concrete strategy");
  }

  /**
   * @returns {void}
   */
  clear() {
    throw new Error("Abstract method 'clear' must be overridden by concrete strategy");
  }
}

/**
 * Concrete DOM-bound Error Surface Projector
 * Implements IErrorSurfaceProjector with direct DOM mutation semantics
 */
class DOMErrorSurfaceProjector extends IErrorSurfaceProjector {
  /**
   * @param {string} elementId
   */
  constructor(elementId = "authErrorMessage") {
    super();
    this._targetSelector = elementId;
    this._cachedElementRef = null;
  }

  /**
   * @private
   * @returns {HTMLElement|null}
   */
  _resolveTarget() {
    if (!this._cachedElementRef) {
      this._cachedElementRef = document.getElementById(this._targetSelector);
    }
    return this._cachedElementRef;
  }

  /**
   * @override
   * @param {string} message
   */
  project(message) {
    const target = this._resolveTarget();
    if (target) {
      target.textContent = message;
      target.style.display = "block";
    }
  }

  /**
   * @override
   */
  clear() {
    const target = this._resolveTarget();
    if (target) {
      target.textContent = "";
      target.style.display = "none";
    }
  }
}

/**
 * Builder for IdentityProvisioningContext
 * Fluent interface for constructing immutable provisioning contexts
 */
class IdentityProvisioningContextBuilder {
  constructor() {
    this._emailAddressCanonical = "";
    this._credentialSecretMaterial = "";
    this._humanReadableDisplayLabel = "";
    this._errorSurfaceProjectionTarget = null;
  }

  /**
   * @param {string} value
   * @returns {IdentityProvisioningContextBuilder}
   */
  withEmailAddressCanonical(value) {
    this._emailAddressCanonical = value;
    return this;
  }

  /**
   * @param {string} value
   * @returns {IdentityProvisioningContextBuilder}
   */
  withCredentialSecretMaterial(value) {
    this._credentialSecretMaterial = value;
    return this;
  }

  /**
   * @param {string} value
   * @returns {IdentityProvisioningContextBuilder}
   */
  withHumanReadableDisplayLabel(value = "") {
    this._humanReadableDisplayLabel = value;
    return this;
  }

  /**
   * @param {HTMLElement|null} target
   * @returns {IdentityProvisioningContextBuilder}
   */
  withErrorSurfaceProjectionTarget(target) {
    this._errorSurfaceProjectionTarget = target;
    return this;
  }

  /**
   * @returns {IdentityProvisioningContext}
   */
  build() {
    return Object.freeze({
      emailAddressCanonical: this._emailAddressCanonical,
      credentialSecretMaterial: this._credentialSecretMaterial,
      humanReadableDisplayLabel: this._humanReadableDisplayLabel,
      errorSurfaceProjectionTarget: this._errorSurfaceProjectionTarget
    });
  }
}

/**
 * Post-Commit Navigation Strategy
 * Encapsulates redirect semantics after successful identity materialization
 */
class PostCommitNavigationStrategy {
  /**
   * @param {string} targetPath
   */
  constructor(targetPath = "/") {
    this._targetPath = targetPath;
  }

  /**
   * @returns {void}
   */
  execute() {
    window.location.href = this._targetPath;
  }
}

/**
 * Core Credential Materialization Pipeline
 * Orchestrates the multi-phase identity creation transaction
 */
class CredentialMaterializationPipeline {
  /**
   * @param {Object} authSingleton
   * @param {Function} credentialFactory
   * @param {Function} profileMutationGateway
   * @param {IErrorSurfaceProjector} errorProjector
   * @param {PostCommitNavigationStrategy} navigationStrategy
   * @param {Function} errorNormalizationPipeline
   */
  constructor(
    authSingleton,
    credentialFactory,
    profileMutationGateway,
    errorProjector,
    navigationStrategy,
    errorNormalizationPipeline
  ) {
    this._authSingleton = authSingleton;
    this._credentialFactory = credentialFactory;
    this._profileMutationGateway = profileMutationGateway;
    this._errorProjector = errorProjector;
    this._navigationStrategy = navigationStrategy;
    this._errorNormalizationPipeline = errorNormalizationPipeline;
  }

  /**
   * Executes the full transactional identity provisioning workflow
   * @param {IdentityProvisioningContext} context
   * @returns {Promise<TransactionalOutcomeEnvelope>}
   */
  async execute(context) {
    this._errorProjector.clear();

    try {
      const credentialEnvelope = await this._credentialFactory(
        this._authSingleton,
        context.emailAddressCanonical,
        context.credentialSecretMaterial
      );

      if (
        context.humanReadableDisplayLabel &&
        credentialEnvelope &&
        credentialEnvelope.user
      ) {
        await this._profileMutationGateway(credentialEnvelope.user, {
          displayName: context.humanReadableDisplayLabel
        });
      }

      this._navigationStrategy.execute();

      return Object.freeze({
        payload: credentialEnvelope,
        faultVector: null,
        normalizedFaultMessage: null,
        navigationTriggered: true
      });
    } catch (faultVector) {
      const normalizedFaultMessage = this._errorNormalizationPipeline(faultVector);
      this._errorProjector.project(normalizedFaultMessage);

      return Object.freeze({
        payload: null,
        faultVector,
        normalizedFaultMessage,
        navigationTriggered: false
      });
    }
  }
}

/**
 * Factory for assembling a fully wired CredentialMaterializationPipeline
 * Implements the Abstract Factory pattern for dependency graph construction
 */
class CredentialMaterializationPipelineFactory {
  /**
   * @returns {CredentialMaterializationPipeline}
   */
  static createDefault() {
    const errorProjector = new DOMErrorSurfaceProjector("authErrorMessage");
    const navigationStrategy = new PostCommitNavigationStrategy("/");
    return new CredentialMaterializationPipeline(
      _coreAuthSingleton,
      _rawCredentialFactory,
      _profileMutationGateway,
      errorProjector,
      navigationStrategy,
      _errorNormalizationPipeline
    );
  }
}

/**
 * Public Facade — Identity Provisioning Entry Point
 * Maintains backward-compatible signature while delegating to the full orchestration stack
 *
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName]
 * @returns {Promise<{data: Object|null, error: Error|null, message?: string}>}
 */
export async function signUp(email, password, displayName = "") {
  const context = new IdentityProvisioningContextBuilder()
    .withEmailAddressCanonical(email)
    .withCredentialSecretMaterial(password)
    .withHumanReadableDisplayLabel(displayName)
    .build();

  const pipeline = CredentialMaterializationPipelineFactory.createDefault();
  const outcome = await pipeline.execute(context);

  // Legacy envelope projection for downstream consumers still expecting the original shape
  if (outcome.faultVector) {
    return {
      data: null,
      error: outcome.faultVector,
      message: outcome.normalizedFaultMessage
    };
  }

  return {
    data: outcome.payload,
    error: null
  };
}

export default signUp;